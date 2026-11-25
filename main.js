import './styles.css';
import Phaser from 'phaser';
import { supabase, isConfigured } from './services/supabase.js';
import { signIn, signUp, signOut, getProfile, saveProfile } from './services/auth.js';
import { startGame } from './game/engine.js';
import { creatures } from './data/creatures.js';

const $ = (id) => document.getElementById(id);
const authScreen = $('auth-screen');
const gameScreen = $('game-screen');
const authForm = $('auth-form');
let authMode = 'login';
let currentUser = null;
let phaserGame = null;
let toastTimer;

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}
function message(text, error = false) {
  $('auth-message').textContent = text;
  $('auth-message').classList.toggle('error', error);
}
function setAuthMode(mode) {
  authMode = mode;
  $('login-tab').classList.toggle('active', mode === 'login');
  $('register-tab').classList.toggle('active', mode === 'register');
  $('username-label').classList.toggle('hidden', mode !== 'register');
  $('username').required = mode === 'register';
  $('auth-submit').textContent = mode === 'login' ? 'Log in' : 'Create account';
  $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  message('');
}
$('login-tab').addEventListener('click', () => setAuthMode('login'));
$('register-tab').addEventListener('click', () => setAuthMode('register'));

function showGame(profile) {
  authScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  $('logout-button').classList.remove('hidden');
  $('trainer-name').textContent = profile?.username || currentUser?.email?.split('@')[0] || 'Trainer';
  renderDex();
  if (!phaserGame) phaserGame = startGame(Phaser, 'game-container', () => openBattle());
}
function showAuth() {
  gameScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
  $('logout-button').classList.add('hidden');
  if (phaserGame) { phaserGame.destroy(true); phaserGame = null; }
}
function renderDex() {
  $('dex-grid').innerHTML = creatures.map(c => `
    <article class="creature-card">
      <div class="creature-art ${c.type.toLowerCase()}">${c.symbol}</div>
      <div class="creature-info"><span class="type-label">${c.type}</span><h4>${c.name}</h4><p>${c.description}</p></div>
    </article>`).join('');
}
authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isConfigured) return message('Add your Supabase URL and anon key to .env before signing in.', true);
  const email = $('email').value.trim();
  const password = $('password').value;
  $('auth-submit').disabled = true;
  message(authMode === 'login' ? 'Signing in…' : 'Creating your account…');
  try {
    if (authMode === 'login') {
      const { data } = await signIn(email, password);
      currentUser = data.user;
      const profile = await getProfile(currentUser.id);
      showGame(profile);
      toast('Welcome back, Trainer!');
    } else {
      const username = $('username').value.trim();
      const { data } = await signUp(email, password, username);
      if (data.user) {
        currentUser = data.user;
        if (data.session) {
          await saveProfile(data.user.id, username);
          showGame({ username });
          toast('Your trainer account is ready!');
        } else {
          message('Account created! Check your email to confirm, then log in.');
          setAuthMode('login');
        }
      }
    }
  } catch (error) {
    message(error.message || 'Something went wrong. Please try again.', true);
  } finally {
    $('auth-submit').disabled = false;
  }
});
$('logout-button').addEventListener('click', async () => {
  try { if (supabase) await signOut(); currentUser = null; showAuth(); toast('You have logged out.'); }
  catch (e) { toast(e.message); }
});
$('connection-status').textContent = isConfigured ? '● Service configured' : '● Setup required';
$('connection-status').classList.toggle('warning', !isConfigured);

async function boot() {
  if (!isConfigured) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    try { showGame(await getProfile(currentUser.id)); }
    catch (error) { toast('Could not load trainer profile: ' + error.message); }
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) { currentUser = null; showAuth(); }
  });
}
function openBattle() {
  $('battle-modal').classList.remove('hidden');
  $('battle-log').textContent = 'Emberling is ready. Choose a move!';
  $('wild-hp').style.width = '100%';
  $('player-hp').style.width = '100%';
  $('battle-actions').classList.remove('hidden');
  $('battle-done').classList.add('hidden');
  $('battle-title').textContent = 'A wild Brookit appears!';
}
$('battle-close').addEventListener('click', () => $('battle-modal').classList.add('hidden'));
$('battle-done').addEventListener('click', () => $('battle-modal').classList.add('hidden'));
$('battle-actions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-damage]');
  if (!button) return;
  const damage = Number(button.dataset.damage);
  const hp = Math.max(0, parseFloat($('wild-hp').style.width || '100') - damage);
  $('wild-hp').style.width = hp + '%';
  if (hp <= 0) {
    $('battle-log').textContent = 'Brookit is tired! Practice encounter complete.';
    $('battle-actions').classList.add('hidden');
    $('battle-done').classList.remove('hidden');
  } else {
    $('battle-log').textContent = `Emberling used ${button.firstChild.textContent.trim()}! Brookit has ${hp}% HP remaining.`;
  }
});
document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b === button));
  ['world','dex','party'].forEach(name => $(`${name}-panel`).classList.toggle('hidden', button.dataset.panel !== name));
  $('panel-title').textContent = ({world:'Verdantia Outskirts',dex:'MonsterDex',party:'Your Party'})[button.dataset.panel];
}));
boot();