import { supabase } from "./supabase.js";


function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");

  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function hasTimeOverlap(
  newStart,
  newDuration,
  existingStart,
  existingDuration
) {
  const newStartMinutes = timeToMinutes(newStart);
  const newEndMinutes = newStartMinutes + Number(newDuration);

  const existingStartMinutes = timeToMinutes(existingStart);
  const existingEndMinutes =
    existingStartMinutes + Number(existingDuration || 0);

  return (
    newStartMinutes < existingEndMinutes &&
    newEndMinutes > existingStartMinutes
  );
}

export async function getBookings() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function getBookingsByDate(date) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", date)
    .in("status", ["pendiente", "confirmada", "en proceso"])
    .order("booking_time", { ascending: true });

  if (error) throw error;

  return data || [];
}

export async function isTimeSlotAvailable({
  booking_date,
  booking_time,
  estimated_duration,
}) {
  const bookingsOfDay = await getBookingsByDate(booking_date);

  const conflict = bookingsOfDay.find((booking) =>
    hasTimeOverlap(
      booking_time,
      estimated_duration,
      booking.booking_time,
      booking.estimated_duration
    )
  );

  return {
    available: !conflict,
    conflict: conflict || null,
  };
}

export async function getAvailableTimeSlots({
  booking_date,
  estimated_duration,
  startHour = "09:30",
  endHour = "16:30",
  intervalMinutes = 30,
}) {
  const bookingsOfDay = await getBookingsByDate(booking_date);

  const startMinutes = timeToMinutes(startHour);
  const endMinutes = timeToMinutes(endHour);

  const availableSlots = [];

  for (
    let currentMinutes = startMinutes;
    currentMinutes + Number(estimated_duration) <= endMinutes;
    currentMinutes += intervalMinutes
  ) {
    const currentTime = minutesToTime(currentMinutes);

    const hasConflict = bookingsOfDay.some((booking) =>
      hasTimeOverlap(
        currentTime,
        estimated_duration,
        booking.booking_time,
        booking.estimated_duration
      )
    );

    if (!hasConflict) {
      availableSlots.push(currentTime);
    }
  }

  return availableSlots;
}

export async function createBooking(bookingData) {
  const { data, error } = await supabase
    .from("bookings")
    .insert([bookingData])
    .select();

  if (error) throw error;

  return data[0];
}

export async function updateBookingStatus(id, newStatus) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data[0];
}

export async function updatePaymentStatus(id, newPaymentStatus) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ payment_status: newPaymentStatus })
    .eq("id", id)
    .select();

  if (error) throw error;

  return data[0];
}

export async function deleteBooking(id) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}