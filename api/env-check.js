function state(name) {
  const value = process.env[name];

  return {
    present: Boolean(value),
    length: value ? value.length : 0,
  };
}

export async function GET() {
  return Response.json({
    SUPABASE_URL: state("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: state("SUPABASE_SERVICE_ROLE_KEY"),
    VITE_SUPABASE_URL: state("VITE_SUPABASE_URL"),
    VITE_SUPABASE_ANON_KEY: state("VITE_SUPABASE_ANON_KEY"),
    SQUARE_ENVIRONMENT: state("SQUARE_ENVIRONMENT"),
    SQUARE_ACCESS_TOKEN: state("SQUARE_ACCESS_TOKEN"),
    SQUARE_LOCATION_ID: state("SQUARE_LOCATION_ID"),
    SITE_URL: state("SITE_URL"),
    NODE_ENV: process.env.NODE_ENV || null,
    VERCEL_ENV: process.env.VERCEL_ENV || null,
  });
}
