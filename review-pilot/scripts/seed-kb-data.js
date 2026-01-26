require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// E-E-A-T Enhanced Knowledge Base Data
const knowledgeBaseData = {
    team: [{
        id: 'mock-team-1',
        name: 'Chef Marco',
        role: 'Head Chef',
        yearsOfExperience: 15,
        certifications: ['Michelin Star Training', 'Italian Culinary Institute'],
        specialties: ['Handmade Pasta', 'Traditional Italian Cuisine'],
        context: 'Specialized in authentic Italian recipes',
        isPublic: true
    }],
    geoKeywords: [
        {
            id: 'mock-geo-1',
            keyword: 'Best Pizza in Hennef',
            priority: 'high',
            usageExample: "We're proud to serve the best pizza in Hennef"
        },
        {
            id: 'mock-geo-2',
            keyword: 'Free Wi-Fi Cafe',
            priority: 'medium',
            usageExample: "Known as a free Wi-Fi cafe"
        }
    ],
    general: {
        policies: ['Pet Friendly - Dogs allowed on patio only.']
    }
};

async function updateKnowledgeBase() {
    try {
        // Find the mock user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
            console.error('Error listing users:', listError);
            return;
        }

        const mockUser = users?.find(u => u.email === 'mock@reviewpilot.ai');

        if (!mockUser) {
            console.error('Mock user not found. Please visit /settings first to create it.');
            return;
        }

        console.log('Found mock user:', mockUser.email);

        // Update the knowledge base
        const { data, error } = await supabase
            .from('businesses')
            .update({ knowledge_base: knowledgeBaseData })
            .eq('user_id', mockUser.id)
            .select();

        if (error) {
            console.error('Error updating knowledge base:', error);
            return;
        }

        console.log('✅ Knowledge base updated successfully!');
        console.log('Data saved:', JSON.stringify(knowledgeBaseData, null, 2));
        console.log('\nNow refresh http://localhost:3000/settings to see Chef Marco with E-E-A-T details!');
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

updateKnowledgeBase();
