import React from 'react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  };

  return (
    <section className={styles.wrapper}>
      {/* Testimonials Part */}
      <div className={styles.header}>
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Trusted by students from <span className={styles.highlight}>Top Campuses</span>
        </motion.h2>
      </div>

      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {reviews.map((rev, i) => (
          <motion.div key={i} className={styles.card} variants={itemVariants}>
            <div className={styles.userSection}>
              <div className={styles.avatar}>{rev.avatar}</div>
              <div className={styles.userInfo}>
                <strong>{rev.name}</strong>
                <span>{rev.handle} • {rev.college}</span>
              </div>
            </div>
            <p className={styles.reviewText}>"{rev.text}"</p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Part */}
      <div className={styles.faqSection}>
        <motion.h2
          className={styles.faqTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Common Questions
        </motion.h2>
        <motion.div
          className={styles.faqGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((item, index) => (
            <motion.div key={index} className={styles.questionBox} variants={itemVariants}>
              <h4 className={styles.question}>{item.q}</h4>
              <p className={styles.answer}>{item.a}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;