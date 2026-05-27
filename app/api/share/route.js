import { ImageResponse } from 'next/og';

// Turn on the Ferrari Edge Engine
export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('list');

    if (!listId) {
      return new Response('Missing list ID parameter', { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    // We use the Service Role Key here to bypass RLS securely on the server
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const headers = {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json'
    };

    // 1. Fetch the Core List Data
    const listRes = await fetch(`${supabaseUrl}/rest/v1/user_lists?id=eq.${listId}&select=title,subtitle,user_id`, { headers });
    const listDataRaw = await listRes.json();

    if (!Array.isArray(listDataRaw)) {
      return new Response(`Supabase rejected the list query: ${JSON.stringify(listDataRaw)}`, { status: 500 });
    }
    if (listDataRaw.length === 0) return new Response('List not found', { status: 404 });
    const listData = listDataRaw[0];

    // 2. Concurrently fetch Profile (for username) & List_Restaurants (for ranking)
    const [profileRes, listRestRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${listData.user_id}&select=username`, { headers }),
      fetch(`${supabaseUrl}/rest/v1/list_restaurants?list_id=eq.${listId}&select=restaurant_id,ranking&order=ranking.asc&limit=4`, { headers })
    ]);

    const profileData = await profileRes.json();
    const listRestaurants = await listRestRes.json();

    // 3. Fetch the actual Restaurant names
    let restaurants = [];
    if (Array.isArray(listRestaurants) && listRestaurants.length > 0) {
      const restIds = listRestaurants.map(lr => lr.restaurant_id).join(',');
      const restRes = await fetch(`${supabaseUrl}/rest/v1/restaurants?id=in.(${restIds})&select=id,name`, { headers });
      const restData = await restRes.json();
      
      // Re-map the names back in their correct 1-to-4 ranked order
      if (Array.isArray(restData)) {
        restaurants = listRestaurants.map(lr => {
           const r = restData.find(rest => String(rest.id) === String(lr.restaurant_id));
           return { name: r ? r.name : 'Unknown Spot' };
        });
      }
    }

    // 4. Assemble the final variables for the poster
    const title = listData.title || 'Gourmet List';
    const subtitle = listData.subtitle || 'Curated spots in NYC';
    const username = Array.isArray(profileData) && profileData.length > 0 ? profileData[0].username : 'anonymous';

    // 5. Render the dynamic premium poster (Cream and Burgundy)
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
                  {item.name}
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
