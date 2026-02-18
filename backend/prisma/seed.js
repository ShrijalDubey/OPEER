import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const threadData = [
    // ═══════════════════════════════════════════════════════
    // IITs (23)
    // ═══════════════════════════════════════════════════════
    { slug: 'iitb', name: 'IIT Bombay', description: 'Indian Institute of Technology Bombay' },
    { slug: 'iitd', name: 'IIT Delhi', description: 'Indian Institute of Technology Delhi' },
    { slug: 'iitm', name: 'IIT Madras', description: 'Indian Institute of Technology Madras' },
    { slug: 'iitk', name: 'IIT Kanpur', description: 'Indian Institute of Technology Kanpur' },
    { slug: 'iitkgp', name: 'IIT Kharagpur', description: 'Indian Institute of Technology Kharagpur' },
    { slug: 'iitr', name: 'IIT Roorkee', description: 'Indian Institute of Technology Roorkee' },
    { slug: 'iitg', name: 'IIT Guwahati', description: 'Indian Institute of Technology Guwahati' },
    { slug: 'iith', name: 'IIT Hyderabad', description: 'Indian Institute of Technology Hyderabad' },
    { slug: 'iitbhu', name: 'IIT BHU Varanasi', description: 'Indian Institute of Technology (BHU) Varanasi' },
    { slug: 'iiti', name: 'IIT Indore', description: 'Indian Institute of Technology Indore' },
    { slug: 'iitp', name: 'IIT Patna', description: 'Indian Institute of Technology Patna' },
    { slug: 'iitgn', name: 'IIT Gandhinagar', description: 'Indian Institute of Technology Gandhinagar' },
    { slug: 'iitj', name: 'IIT Jodhpur', description: 'Indian Institute of Technology Jodhpur' },
    { slug: 'iitrpr', name: 'IIT Ropar', description: 'Indian Institute of Technology Ropar' },
    { slug: 'iitbbs', name: 'IIT Bhubaneswar', description: 'Indian Institute of Technology Bhubaneswar' },
    { slug: 'iitmandi', name: 'IIT Mandi', description: 'Indian Institute of Technology Mandi' },
    { slug: 'iitpkd', name: 'IIT Palakkad', description: 'Indian Institute of Technology Palakkad' },
    { slug: 'iittn', name: 'IIT Tirupati', description: 'Indian Institute of Technology Tirupati' },
    { slug: 'iitism', name: 'IIT ISM Dhanbad', description: 'Indian Institute of Technology (ISM) Dhanbad' },
    { slug: 'iitdh', name: 'IIT Dharwad', description: 'Indian Institute of Technology Dharwad' },
    { slug: 'iitbhilai', name: 'IIT Bhilai', description: 'Indian Institute of Technology Bhilai' },
    { slug: 'iitgoa', name: 'IIT Goa', description: 'Indian Institute of Technology Goa' },
    { slug: 'iitjmu', name: 'IIT Jammu', description: 'Indian Institute of Technology Jammu' },

    // ═══════════════════════════════════════════════════════
    // NITs (31)
    // ═══════════════════════════════════════════════════════
    { slug: 'nitk', name: 'NIT Karnataka (Surathkal)', description: 'National Institute of Technology Karnataka' },
    { slug: 'nitt', name: 'NIT Trichy', description: 'National Institute of Technology Tiruchirappalli' },
    { slug: 'nitw', name: 'NIT Warangal', description: 'National Institute of Technology Warangal' },
    { slug: 'nitr', name: 'NIT Rourkela', description: 'National Institute of Technology Rourkela' },
    { slug: 'nitc', name: 'NIT Calicut', description: 'National Institute of Technology Calicut' },
    { slug: 'mnit', name: 'MNIT Jaipur', description: 'Malaviya National Institute of Technology Jaipur' },
    { slug: 'mnnit', name: 'MNNIT Allahabad', description: 'Motilal Nehru NIT Allahabad' },
    { slug: 'vnit', name: 'VNIT Nagpur', description: 'Visvesvaraya National Institute of Technology Nagpur' },
    { slug: 'svnit', name: 'SVNIT Surat', description: 'Sardar Vallabhbhai NIT Surat' },
    { slug: 'nitdgp', name: 'NIT Durgapur', description: 'National Institute of Technology Durgapur' },
    { slug: 'nita', name: 'NIT Agartala', description: 'National Institute of Technology Agartala' },
    { slug: 'nitap', name: 'NIT Arunachal Pradesh', description: 'National Institute of Technology Arunachal Pradesh' },
    { slug: 'nitdel', name: 'NIT Delhi', description: 'National Institute of Technology Delhi' },
    { slug: 'nitgoa', name: 'NIT Goa', description: 'National Institute of Technology Goa' },
    { slug: 'nith', name: 'NIT Hamirpur', description: 'National Institute of Technology Hamirpur' },
    { slug: 'nitjsr', name: 'NIT Jamshedpur', description: 'National Institute of Technology Jamshedpur' },
    { slug: 'nitkur', name: 'NIT Kurukshetra', description: 'National Institute of Technology Kurukshetra' },
    { slug: 'nitmani', name: 'NIT Manipur', description: 'National Institute of Technology Manipur' },
    { slug: 'nitmeg', name: 'NIT Meghalaya', description: 'National Institute of Technology Meghalaya' },
    { slug: 'nitmiz', name: 'NIT Mizoram', description: 'National Institute of Technology Mizoram' },
    { slug: 'nitnag', name: 'NIT Nagaland', description: 'National Institute of Technology Nagaland' },
    { slug: 'nitpy', name: 'NIT Puducherry', description: 'National Institute of Technology Puducherry' },
    { slug: 'nitraipur', name: 'NIT Raipur', description: 'National Institute of Technology Raipur' },
    { slug: 'nitsik', name: 'NIT Sikkim', description: 'National Institute of Technology Sikkim' },
    { slug: 'nitsri', name: 'NIT Srinagar', description: 'National Institute of Technology Srinagar' },
    { slug: 'nitsilchar', name: 'NIT Silchar', description: 'National Institute of Technology Silchar' },
    { slug: 'nitjal', name: 'NIT Jalandhar', description: 'Dr B R Ambedkar NIT Jalandhar' },
    { slug: 'nitpat', name: 'NIT Patna', description: 'National Institute of Technology Patna' },
    { slug: 'nituk', name: 'NIT Uttarakhand', description: 'National Institute of Technology Uttarakhand' },
    { slug: 'manit', name: 'MANIT Bhopal', description: 'Maulana Azad NIT Bhopal' },
    { slug: 'nitanda', name: 'NIT Andhra Pradesh', description: 'National Institute of Technology Andhra Pradesh' },

    // ═══════════════════════════════════════════════════════
    // IIITs (25)
    // ═══════════════════════════════════════════════════════
    { slug: 'iiitb', name: 'IIIT Bangalore', description: 'International Institute of IT Bangalore' },
    { slug: 'iiith', name: 'IIIT Hyderabad', description: 'International Institute of IT Hyderabad' },
    { slug: 'iiita', name: 'IIIT Allahabad', description: 'Indian Institute of IT Allahabad' },
    { slug: 'iiitd', name: 'IIIT Delhi', description: 'Indraprastha Institute of IT Delhi' },
    { slug: 'iiitdm', name: 'IIITDM Jabalpur', description: 'IIIT Design & Manufacturing Jabalpur' },
    { slug: 'iiitdmk', name: 'IIITDM Kancheepuram', description: 'IIIT Design & Manufacturing Kancheepuram' },
    { slug: 'iiitg', name: 'IIIT Guwahati', description: 'Indian Institute of IT Guwahati' },
    { slug: 'iiitkota', name: 'IIIT Kota', description: 'Indian Institute of IT Kota' },
    { slug: 'iiitl', name: 'IIIT Lucknow', description: 'Indian Institute of IT Lucknow' },
    { slug: 'iiitnr', name: 'IIIT Nagpur', description: 'Indian Institute of IT Nagpur' },
    { slug: 'iiitpune', name: 'IIIT Pune', description: 'Indian Institute of IT Pune' },
    { slug: 'iiitranchi', name: 'IIIT Ranchi', description: 'Indian Institute of IT Ranchi' },
    { slug: 'iiitsurat', name: 'IIIT Surat', description: 'Indian Institute of IT Surat' },
    { slug: 'iiitvadodara', name: 'IIIT Vadodara', description: 'Indian Institute of IT Vadodara' },
    { slug: 'iiitsonepat', name: 'IIIT Sonepat', description: 'Indian Institute of IT Sonepat' },
    { slug: 'iiitkalyani', name: 'IIIT Kalyani', description: 'Indian Institute of IT Kalyani' },
    { slug: 'iiituna', name: 'IIIT Una', description: 'Indian Institute of IT Una' },
    { slug: 'iiitkottayam', name: 'IIIT Kottayam', description: 'Indian Institute of IT Kottayam' },
    { slug: 'iiitagartala', name: 'IIIT Agartala', description: 'Indian Institute of IT Agartala' },
    { slug: 'iiitbhopal', name: 'IIIT Bhopal', description: 'Indian Institute of IT Bhopal' },
    { slug: 'iiitdharwad', name: 'IIIT Dharwad', description: 'Indian Institute of IT Dharwad' },
    { slug: 'iiitraichur', name: 'IIIT Raichur', description: 'Indian Institute of IT Raichur' },
    { slug: 'iiitbhagalpur', name: 'IIIT Bhagalpur', description: 'Indian Institute of IT Bhagalpur' },
    { slug: 'iiitsrirangam', name: 'IIIT Tiruchirappalli', description: 'Indian Institute of IT Tiruchirappalli' },
    { slug: 'iiitmk', name: 'IIIT Manipur', description: 'Indian Institute of IT Manipur' },

    // ═══════════════════════════════════════════════════════
    // BITS Pilani Campuses
    // ═══════════════════════════════════════════════════════
    { slug: 'bitsp', name: 'BITS Pilani', description: 'Birla Institute of Technology & Science, Pilani' },
    { slug: 'bitsg', name: 'BITS Goa', description: 'BITS Pilani — Goa Campus' },
    { slug: 'bitsh', name: 'BITS Hyderabad', description: 'BITS Pilani — Hyderabad Campus' },
    { slug: 'bitsd', name: 'BITS Dubai', description: 'BITS Pilani — Dubai Campus' },

    // ═══════════════════════════════════════════════════════
    // IISc & IISERs
    // ═══════════════════════════════════════════════════════
    { slug: 'iisc', name: 'IISc Bangalore', description: 'Indian Institute of Science Bangalore' },
    { slug: 'iiserpune', name: 'IISER Pune', description: 'Indian Institute of Science Education & Research Pune' },
    { slug: 'iiserkol', name: 'IISER Kolkata', description: 'IISER Kolkata' },
    { slug: 'iiserbpr', name: 'IISER Bhopal', description: 'IISER Bhopal' },
    { slug: 'iisermoh', name: 'IISER Mohali', description: 'IISER Mohali' },
    { slug: 'iisertvm', name: 'IISER Thiruvananthapuram', description: 'IISER Thiruvananthapuram' },
    { slug: 'iiserbr', name: 'IISER Berhampur', description: 'IISER Berhampur' },
    { slug: 'iisertlp', name: 'IISER Tirupati', description: 'IISER Tirupati' },

    // ═══════════════════════════════════════════════════════
    // Top Delhi Universities & Colleges
    // ═══════════════════════════════════════════════════════
    { slug: 'dtu', name: 'DTU Delhi', description: 'Delhi Technological University' },
    { slug: 'nsut', name: 'NSUT Delhi', description: 'Netaji Subhas University of Technology Delhi' },
    { slug: 'igdtuw', name: 'IGDTUW Delhi', description: 'Indira Gandhi Delhi Technical University for Women' },
    { slug: 'ipu', name: 'IPU Delhi', description: 'Guru Gobind Singh Indraprastha University' },
    { slug: 'jnu', name: 'JNU Delhi', description: 'Jawaharlal Nehru University Delhi' },
    { slug: 'du', name: 'Delhi University', description: 'University of Delhi' },
    { slug: 'jmi', name: 'Jamia Millia Islamia', description: 'Jamia Millia Islamia, Delhi' },
    { slug: 'amu', name: 'AMU Aligarh', description: 'Aligarh Muslim University' },

    // ═══════════════════════════════════════════════════════
    // Top Private — Engineering & Tech
    // ═══════════════════════════════════════════════════════
    { slug: 'vitv', name: 'VIT Vellore', description: 'Vellore Institute of Technology' },
    { slug: 'vitc', name: 'VIT Chennai', description: 'VIT Chennai Campus' },
    { slug: 'vitap', name: 'VIT-AP Amaravati', description: 'VIT-AP University' },
    { slug: 'vitb', name: 'VIT Bhopal', description: 'VIT Bhopal University' },
    { slug: 'srm', name: 'SRM Chennai', description: 'SRM Institute of Science and Technology' },
    { slug: 'srmap', name: 'SRM AP', description: 'SRM University AP' },
    { slug: 'manipal', name: 'MIT Manipal', description: 'Manipal Institute of Technology' },
    { slug: 'manipalj', name: 'Manipal Jaipur', description: 'Manipal University Jaipur' },
    { slug: 'thapar', name: 'Thapar Patiala', description: 'Thapar Institute of Engineering & Technology' },
    { slug: 'lpu', name: 'LPU Phagwara', description: 'Lovely Professional University' },
    { slug: 'amity', name: 'Amity Noida', description: 'Amity University Noida' },
    { slug: 'jiit', name: 'JIIT Noida', description: 'Jaypee Institute of IT Noida' },
    { slug: 'juet', name: 'JUET Guna', description: 'Jaypee University of Engineering and Technology' },
    { slug: 'bennett', name: 'Bennett Greater Noida', description: 'Bennett University (Times of India Group)' },
    { slug: 'shiv', name: 'Shiv Nadar', description: 'Shiv Nadar University Greater Noida' },
    { slug: 'ashoka', name: 'Ashoka University', description: 'Ashoka University, Sonipat' },
    { slug: 'plaksha', name: 'Plaksha University', description: 'Plaksha University, Mohali' },
    { slug: 'pec', name: 'PEC Chandigarh', description: 'Punjab Engineering College Chandigarh' },
    { slug: 'coep', name: 'COEP Pune', description: 'College of Engineering Pune' },
    { slug: 'vjti', name: 'VJTI Mumbai', description: 'Veermata Jijabai Technological Institute' },
    { slug: 'ictmumbai', name: 'ICT Mumbai', description: 'Institute of Chemical Technology Mumbai' },

    // ═══════════════════════════════════════════════════════
    // Top State & Central Universities
    // ═══════════════════════════════════════════════════════
    { slug: 'bhu', name: 'BHU Varanasi', description: 'Banaras Hindu University' },
    { slug: 'jadavpur', name: 'Jadavpur University', description: 'Jadavpur University Kolkata' },
    { slug: 'anna', name: 'Anna University', description: 'Anna University Chennai' },
    { slug: 'cusat', name: 'CUSAT Kochi', description: 'Cochin University of Science and Technology' },
    { slug: 'hbtu', name: 'HBTU Kanpur', description: 'Harcourt Butler Technical University' },
    { slug: 'pu', name: 'Panjab University', description: 'Panjab University Chandigarh' },
    { slug: 'osu', name: 'Osmania University', description: 'Osmania University Hyderabad' },
    { slug: 'mu', name: 'Mumbai University', description: 'University of Mumbai' },
    { slug: 'uoh', name: 'University of Hyderabad', description: 'University of Hyderabad' },
    { slug: 'cu', name: 'Calcutta University', description: 'University of Calcutta' },
    { slug: 'msu', name: 'MSU Baroda', description: 'Maharaja Sayajirao University of Baroda' },
    { slug: 'sau', name: 'Savitribai Phule Pune University', description: 'Savitribai Phule Pune University' },

    // ═══════════════════════════════════════════════════════
    // Top Private — General & Multidisciplinary
    // ═══════════════════════════════════════════════════════
    { slug: 'christ', name: 'Christ University', description: 'Christ University Bangalore' },
    { slug: 'sym', name: 'Symbiosis Pune', description: 'Symbiosis International University Pune' },
    { slug: 'flame', name: 'FLAME Pune', description: 'FLAME University Pune' },
    { slug: 'mit-wpu', name: 'MIT-WPU Pune', description: 'MIT World Peace University Pune' },
    { slug: 'kiit', name: 'KIIT Bhubaneswar', description: 'Kalinga Institute of Industrial Technology' },
    { slug: 'pes', name: 'PES University', description: 'PES University Bangalore' },
    { slug: 'rv', name: 'RV College Bangalore', description: 'RV College of Engineering Bangalore' },
    { slug: 'bmsit', name: 'BMS Bangalore', description: 'BMS College of Engineering Bangalore' },
    { slug: 'dayananda', name: 'Dayananda Sagar', description: 'Dayananda Sagar University Bangalore' },
    { slug: 'sastra', name: 'SASTRA Thanjavur', description: 'SASTRA Deemed University' },

    // ═══════════════════════════════════════════════════════
    // Medical — AIIMS
    // ═══════════════════════════════════════════════════════
    { slug: 'aiimsd', name: 'AIIMS Delhi', description: 'All India Institute of Medical Sciences Delhi' },
    { slug: 'aiimsbpl', name: 'AIIMS Bhopal', description: 'AIIMS Bhopal' },
    { slug: 'aiimsjdp', name: 'AIIMS Jodhpur', description: 'AIIMS Jodhpur' },
    { slug: 'aiimsptna', name: 'AIIMS Patna', description: 'AIIMS Patna' },
    { slug: 'aiimsrishikesh', name: 'AIIMS Rishikesh', description: 'AIIMS Rishikesh' },

    // ═══════════════════════════════════════════════════════
    // Other Notable
    // ═══════════════════════════════════════════════════════
    { slug: 'nlu', name: 'NLU Delhi', description: 'National Law University Delhi' },
    { slug: 'nlub', name: 'NLSIU Bangalore', description: 'National Law School of India University Bangalore' },
    { slug: 'isb', name: 'ISB Hyderabad', description: 'Indian School of Business Hyderabad' },
    { slug: 'iimb', name: 'IIM Bangalore', description: 'Indian Institute of Management Bangalore' },
    { slug: 'iima', name: 'IIM Ahmedabad', description: 'Indian Institute of Management Ahmedabad' },
    { slug: 'iimc', name: 'IIM Calcutta', description: 'Indian Institute of Management Calcutta' },
    { slug: 'iiml', name: 'IIM Lucknow', description: 'Indian Institute of Management Lucknow' },
    { slug: 'nid', name: 'NID Ahmedabad', description: 'National Institute of Design Ahmedabad' },
    { slug: 'nift', name: 'NIFT Delhi', description: 'National Institute of Fashion Technology Delhi' },
    { slug: 'ism', name: 'ISM NMIMS Mumbai', description: 'NMIMS University Mumbai' },
    { slug: 'upes', name: 'UPES Dehradun', description: 'University of Petroleum & Energy Studies' },
    { slug: 'chandigarh', name: 'Chandigarh University', description: 'Chandigarh University, Mohali' },
    { slug: 'chitkara', name: 'Chitkara University', description: 'Chitkara University Punjab' },
    { slug: 'galgotias', name: 'Galgotias University', description: 'Galgotias University Greater Noida' },
    { slug: 'snu', name: 'Sharda University', description: 'Sharda University Greater Noida' },
    { slug: 'woxsen', name: 'Woxsen University', description: 'Woxsen University Hyderabad' },
];

async function main() {
    console.log('🌱 Seeding database...');

    for (const t of threadData) {
        await prisma.thread.upsert({
            where: { slug: t.slug },
            update: { name: t.name, description: t.description },
            create: t,
        });
    }

    console.log(`  ✓ ${threadData.length} threads seeded`);
    console.log('✅ Seed complete!');
}

main()
    .catch((e) => {
        console.error('Seed error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
