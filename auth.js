import { supabase } from './supabase.js';

export async function signUp(email, password, username) {
  return supabase.auth.signUp({
    email, password,
    options: { data: { username } }
  });
}
export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signOut() {
  return supabase.auth.signOut();
}
export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('id, username, trainer_level').eq('id', userId).single();
  if (error) throw error;
  return data;
}
export async function saveProfile(userId, username) {
  const { data, error } = await supabase.from('profiles')
    .upsert({ id: userId, username }, { onConflict: 'id' })
    .select().single();
  if (error) throw error;
  return data;
}
