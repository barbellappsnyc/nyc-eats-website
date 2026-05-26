import { createClient } from '@supabase/supabase-js';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Initialize the Supabase client using your secure vault keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req) {
  try {
    // 1. Extract the list ID from the URL query string
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('list');

    if (!listId) {
      return new Response('Missing list ID parameter', { status: 400 });
    }

    // 2. Fetch the list data from your Supabase database
    // We match the RPC logic from your Flutter app's _fetchMyLists/_fetchExploreLists
    const { data: listData, error } = await supabase
      .from('user_lists')
      .select('title, subtitle, restaurants, username')
      .eq('id', listId)
      .single();

    if (error || !listData) {
      return new Response('List not found or database error', { status: 404 });
    }

    const title = listData.title || 'Gourmet List';
    const subtitle = listData.subtitle || 'Curated spots in NYC';
    const username = listData.username || 'anonymous';
    const restaurants = Array.isArray(listData.restaurants) ? listData.restaurants.slice(0, 4) : [];

    // 3. Render the dynamic premium poster using Satori (HTML/CSS)
    // This perfectly replicates your Flutter UI geometry: Cream background (#FDFBF7), Burgundy accents (#3D0A1A)
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FDFBF7',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Header Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#1A1A1A', margin: 0, paddingBottom: '8px' }}>
              {title}
            </h1>
            <p style={{ fontSize: '20px', fontWeight: '500', color: '#4A3728', margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: '2px', backgroundColor: '#EAE6DF', width: '100%', marginBottom: '24px' }} />

          {/* Core Restaurant Slots Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            {restaurants.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '14px',
                  width: '100%',
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#3D0A1A',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '22px',
                    fontWeight: '800',
                    marginRight: '16px',
                  }}
                >
                  {index + 1}
                </div>

                {/* Restaurant Card Slot */}
                <div
                  style={{
                    display: 'flex',
                    flexGrow: 1,
                    backgroundColor: '#F6F2EB',
                    borderRadius: '14px',
                    padding: '14px 20px',
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#3D0A1A',
                  }}
                >
                  {item.name || `Spot #${index + 1}`}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Zone */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1A1A1A' }}>
                @{username}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#D4A24C', marginTop: '2px', letterSpacing: '1px' }}>
                GOURMET PASSPORT
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630, // Standard professional OG card dimensions (1.91:1 aspect ratio)
      }
    );
  } catch (e) {
    return new Response(`Failed to generate dynamic preview card: ${e.message}`, { status: 500 });
  }
}
