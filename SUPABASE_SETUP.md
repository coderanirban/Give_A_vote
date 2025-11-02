# Supabase Database Setup for Tracking Links

## Instructions
Run these SQL commands in your Supabase SQL Editor to set up the database tables.

## 1. Create tracking_links table

```sql
-- Create tracking_links table
CREATE TABLE IF NOT EXISTS tracking_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tracking_links_short_code ON tracking_links(short_code);
CREATE INDEX idx_tracking_links_user_id ON tracking_links(user_id);

-- Enable Row Level Security
ALTER TABLE tracking_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own links
CREATE POLICY "Users can view own tracking links"
  ON tracking_links FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own links
CREATE POLICY "Users can create tracking links"
  ON tracking_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own links
CREATE POLICY "Users can update own tracking links"
  ON tracking_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own links
CREATE POLICY "Users can delete own tracking links"
  ON tracking_links FOR DELETE
  USING (auth.uid() = user_id);
```

## 2. Create link_clicks table

```sql
-- Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES tracking_links(id) ON DELETE CASCADE,
  ip_address TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  user_agent TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_clicked_at ON link_clicks(clicked_at);

-- Enable Row Level Security
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert click data (public tracking links)
CREATE POLICY "Anyone can insert click data"
  ON link_clicks FOR INSERT
  WITH CHECK (true);

-- Policy: Users can view clicks for their own links
CREATE POLICY "Users can view clicks for own links"
  ON link_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tracking_links
      WHERE tracking_links.id = link_clicks.link_id
      AND tracking_links.user_id = auth.uid()
    )
  );
```

## 3. Create a function to get link statistics

```sql
-- Function to get click count for a link
CREATE OR REPLACE FUNCTION get_link_stats(link_uuid UUID)
RETURNS TABLE (
  total_clicks BIGINT,
  unique_ips BIGINT,
  last_click TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_clicks,
    COUNT(DISTINCT ip_address)::BIGINT as unique_ips,
    MAX(clicked_at) as last_click
  FROM link_clicks
  WHERE link_id = link_uuid;
END;
$$ LANGUAGE plpgsql;
```

## 4. Enable Realtime (Optional)

If you want real-time updates for clicks:

```sql
-- Enable realtime for link_clicks table
ALTER PUBLICATION supabase_realtime ADD TABLE link_clicks;
```

## Testing

After running these commands, you can test with:

```sql
-- Test insert (replace user_id with actual UUID from auth.users)
INSERT INTO tracking_links (user_id, title, original_url, short_code)
VALUES ('your-user-id-here', 'Test Link', 'https://example.com', 'test123');

-- Test click insert
INSERT INTO link_clicks (link_id, ip_address, country, city)
VALUES ('link-id-here', '192.168.1.1', 'United States', 'New York');

-- Test stats function
SELECT * FROM get_link_stats('link-id-here');
```
