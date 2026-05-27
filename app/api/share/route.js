import { ImageResponse } from 'next/og';

// Turn on the Ferrari Edge Engine
export const runtime = 'edge';

// In Next.js, API routes use the GET function
export async function GET(request) {
  try {
    // 1. Extract the list ID from the URL
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('list');

    if (!listId) {
      return new Response('Missing list ID parameter', { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    // 2. Fetch directly from Supabase (Lightweight, Edge-friendly)
    const response = await fetch(
      `${supabaseUrl}/rest/v1/user_lists?id=eq.${listId}&select=title,subtitle,restaurants,username`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    // 1. Antifragile check: Did Supabase hand us an error object instead of data?
    if (data.error || data.message) {
      return new Response(`Supabase Error: ${data.error || data.message}`, { status: 500 });
    }
    
    // 2. Safely verify it is actually an array before proceeding
    if (!data || !Array.isArray(data) || data.length === 0) {
      return new Response('List not found', { status: 404 });
    }
    
    const listData = data[0];
    // ... proceed with rendering
    const title = listData.title || 'Gourmet List';
    const subtitle = listData.subtitle || 'Curated spots in NYC';
    const username = listData.username || 'anonymous';
    const restaurants = Array.isArray(listData.restaurants) ? listData.restaurants.slice(0, 4) : [];

    // 3. Render the dynamic premium poster (Cream and Burgundy)
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
        height: 630, 
      }
    );
  } catch (e) {
    return new Response(`Failed to generate card: ${e.message}`, { status: 500 });
  }
}
