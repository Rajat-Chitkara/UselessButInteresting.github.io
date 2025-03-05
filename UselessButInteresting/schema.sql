-- Create tables for facts
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT TRUE,
  submittedBy TEXT,
  source TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for submitted facts awaiting approval
CREATE TABLE submitted_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  submittedBy TEXT NOT NULL,
  source TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
-- Enable RLS on both tables
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE submitted_facts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved facts
CREATE POLICY "Allow public read access to approved facts" 
  ON facts FOR SELECT 
  USING (approved = true);

-- Allow authenticated users (admin) to do anything with facts
CREATE POLICY "Allow authenticated users full access to facts" 
  ON facts FOR ALL 
  USING (auth.role() = 'authenticated');

-- Allow anyone to insert into submitted_facts
CREATE POLICY "Allow public to submit facts" 
  ON submitted_facts FOR INSERT 
  TO anon;

-- Allow authenticated users (admin) to do anything with submitted_facts
CREATE POLICY "Allow authenticated users full access to submitted_facts" 
  ON submitted_facts FOR ALL 
  USING (auth.role() = 'authenticated');

