import { supabase } from '../lib/supabase'

const TABLE_SLOTS = 'slots'
const TABLE_BOOKINGS = 'bookings'

export async function listSlots() {
  if (!supabase) return { data: [], error: new Error('Supabase not configured') }

  const { data, error } = await supabase
    .from(TABLE_SLOTS)
    .select('*')
    .order('slot_start', { ascending: true })

  return { data, error }
}

export async function createBooking(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }

  const { data, error } = await supabase
    .from(TABLE_BOOKINGS)
    .insert(payload)
    .select()
    .single()

  return { data, error }
}
