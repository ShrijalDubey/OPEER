import React from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const reviews = [
    {
      name: "Arjun Mehta",
      handle: "@arjun_codes",
      college: "IIT Bombay",
      text: "Found a stellar backend dev for our Smart India Hackathon project in just 2 days through /iitb. Game changer!",
      avatar: "AM"
    },
    {
      name: "Sneha Rao",
      handle: "@sneha_ui",
      college: "NIT Warangal",
      text: "I love the subreddit vibe. It's so much easier to pitch a personal project here than on LinkedIn or WhatsApp groups.",
      avatar: "SR"
    },
    {
      name: "Rahul V.",
      handle: "@rv_dev",
      college: "BITS Pilani",
      text: "The /bits thread is buzzing! Finally a place where I can see what other students are actually building on campus.",
      avatar: "RV"
    }
  ];

  const faqs = [
    {
      q: "Is OPEER free to use?",
      a: "Yes. We believe in open access to innovation. It is 100% free for students to join threads and post projects."
    },
    {
      q: "Can I join multiple campus threads?",
      a: "You can browse any thread to see what others are building, but you can only post in the thread of the campus you are verified with."
    },
    {
      q: "Do I need a project to join?",
      a: "Not at all. You can join to explore, offer your skills to existing teams, or just learn from the community."
    },
    {
      q: "Is this for coding only?",
      a: "No. Projects need designers, writers, product managers, and marketers. If you have a skill to contribute, you belong here."
    }
  ];

  return (
    <section className={styles.wrapper}>
      {/* Testimonials Part */}
      <div className={styles.header}>
        <h2 className={styles.title}>Trusted by students from <span className={styles.highlight}>Top Campuses</span></h2>
      </div>
      
      <div className={styles.grid}>
        {reviews.map((rev, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.userSection}>
              <div className={styles.avatar}>{rev.avatar}</div>
              <div className={styles.userInfo}>
                <strong>{rev.name}</strong>
                <span>{rev.handle} • {rev.college}</span>
              </div>
            </div>
            <p className={styles.reviewText}>"{rev.text}"</p>
          </div>
        ))}
      </div>

      {/* FAQ Part */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Common Questions</h2>
        <div className={styles.faqGrid}>
          {faqs.map((item, index) => (
            <div key={index} className={styles.questionBox}>
              <h4 className={styles.question}>{item.q}</h4>
              <p className={styles.answer}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;