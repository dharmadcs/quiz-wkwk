// --- SUPABASE CLIENT MODULE ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let supabase = null;
let isConfigured = false;

// Initialize Supabase client with configuration from server
async function initSupabase() {
    if (isConfigured) {
        return supabase;
    }

    try {
        // Fetch configuration from server API
        const response = await fetch('/api/config');
        const config = await response.json();
        
        supabase = createClient(config.supabaseUrl, config.supabaseKey);
        isConfigured = true;
        console.log('✅ Supabase client initialized');
        return supabase;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return null;
    }
}

// Get Supabase client instance
export async function getSupabase() {
    if (!isConfigured) {
        return await initSupabase();
    }
    return supabase;
}

// Save player score to Supabase
export async function saveScore(playerName, score, streak, avatar = '🏆') {
    try {
        console.log('🔵 Attempting to save score to Supabase...');
        console.log('📊 Score data:', { playerName, score, streak, avatar });
        
        const client = await getSupabase();
        if (!client) {
            console.warn('⚠️  Supabase not configured, using local storage fallback');
            return null;
        }

        console.log('✅ Supabase client initialized, sending insert request...');
        
        const { data, error } = await client
            .from('scores')
            .insert([
                {
                    player_name: playerName,
                    score: score,
                    streak: streak,
                    avatar: avatar,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase Error Details:', error);
            console.error('   Code:', error.code);
            console.error('   Message:', error.message);
            console.error('   Details:', error.details);
            console.error('   Hint:', error.hint);
            throw error;
        }
        
        console.log('✅ Score saved successfully to Supabase!');
        console.log('📝 Saved data:', data);
        return data;
    } catch (error) {
        console.error('❌ Error saving score:', error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        return null;
    }
}

// Fetch top scores from Supabase
export async function getTopScores(limit = 10) {
    try {
        const client = await getSupabase();
        if (!client) {
            console.warn('Supabase not configured, using local storage fallback');
            return null;
        }

        const { data, error } = await client
            .from('scores')
            .select('*')
            .order('score', { ascending: false })
            .limit(limit);

        if (error) throw error;
        console.log('✅ Top scores fetched from Supabase');
        return data;
    } catch (error) {
        console.error('❌ Error fetching scores:', error);
        return null;
    }
}

// Check if player name already exists
export async function checkPlayerExists(playerName) {
    try {
        const client = await getSupabase();
        if (!client) {
            return false;
        }

        const { data, error } = await client
            .from('scores')
            .select('player_name')
            .eq('player_name', playerName)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    } catch (error) {
        console.error('❌ Error checking player name:', error);
        return false;
    }
}

// Check if Supabase is configured
export function isSupabaseConfigured() {
    return isConfigured && supabase !== null;
}
