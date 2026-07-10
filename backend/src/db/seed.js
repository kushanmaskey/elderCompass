import pool from './pool.js';

const homes = [
  {
    name: 'Sunrise Senior Living - Beverly Hills',
    address: '9350 Wilshire Blvd',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    phone: '(310) 275-4800',
    website: 'https://www.sunriseseniorliving.com',
    description: 'Luxury senior community offering assisted living and memory care in the heart of Beverly Hills.',
    capacity: 80,
    rating: 4.7,
  },
  {
    name: 'Belmont Village Senior Living',
    address: '1000 S Westgate Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90049',
    phone: '(310) 440-7700',
    website: 'https://belmontvillage.com',
    description: 'Award-winning senior living community with personalized care programs.',
    capacity: 120,
    rating: 4.5,
  },
  {
    name: 'The Watermark at Beverly Hills',
    address: '325 N Maple Dr',
    city: 'Beverly Hills',
    state: 'CA',
    zipcode: '90210',
    phone: '(310) 278-7700',
    website: null,
    description: 'Premier retirement community featuring resort-style amenities and exceptional care.',
    capacity: 95,
    rating: 4.8,
  },
  {
    name: 'Atria Senior Living',
    address: '11901 Santa Monica Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipcode: '90025',
    phone: '(310) 820-6655',
    website: 'https://atriaseniorliving.com',
    description: 'Vibrant independent and assisted living with engaging social programs.',
    capacity: 150,
    rating: 4.3,
  },
  {
    name: 'BrightSpring Health Services',
    address: '200 E 65th St',
    city: 'New York',
    state: 'NY',
    zipcode: '10065',
    phone: '(212) 535-1000',
    website: null,
    description: 'Comprehensive senior care including skilled nursing and rehabilitation on the Upper East Side.',
    capacity: 200,
    rating: 4.1,
  },
  {
    name: 'The Bristal Assisted Living',
    address: '305 E 40th St',
    city: 'New York',
    state: 'NY',
    zipcode: '10016',
    phone: '(212) 949-8700',
    website: 'https://www.thebristal.com',
    description: 'Upscale assisted living with a warm, family-centered environment in Midtown Manhattan.',
    capacity: 110,
    rating: 4.6,
  },
  {
    name: 'Sunrise Senior Living - Buckhead',
    address: '3116 Maple Dr NE',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30305',
    phone: '(404) 233-1111',
    website: 'https://www.sunriseseniorliving.com',
    description: 'Assisted living and memory care in the vibrant Buckhead neighborhood.',
    capacity: 90,
    rating: 4.4,
  },
  {
    name: 'Arbor Terrace of Buckhead',
    address: '2897 Pharr Ct NW',
    city: 'Atlanta',
    state: 'GA',
    zipcode: '30305',
    phone: '(404) 233-7340',
    website: 'https://www.arborterrace.com',
    description: 'Dedicated memory care community with specialized dementia programming.',
    capacity: 60,
    rating: 4.9,
  },
  {
    name: 'Emerald City Senior Living',
    address: '1200 5th Ave',
    city: 'Seattle',
    state: 'WA',
    zipcode: '98101',
    phone: '(206) 624-5000',
    website: null,
    description: 'Independent and assisted living in the heart of downtown Seattle with stunning views.',
    capacity: 130,
    rating: 4.2,
  },
  {
    name: 'Merrill Gardens at First Hill',
    address: '1225 Spring St',
    city: 'Seattle',
    state: 'WA',
    zipcode: '98104',
    phone: '(206) 682-2442',
    website: 'https://www.merrillgardens.com',
    description: 'Contemporary senior living community with chef-prepared meals and enriching activities.',
    capacity: 100,
    rating: 4.5,
  },
];

async function seed() {
  try {
    for (const home of homes) {
      await pool.query(
        `INSERT INTO senior_homes (name, address, city, state, zipcode, phone, website, description, capacity, rating)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT DO NOTHING`,
        [home.name, home.address, home.city, home.state, home.zipcode,
         home.phone, home.website, home.description, home.capacity, home.rating]
      );
    }
    console.log(`Seeded ${homes.length} senior homes.`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
