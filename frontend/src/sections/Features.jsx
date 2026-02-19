import React from 'react';
import { motion } from 'framer-motion';
import styles from './Features.module.css';

const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 40, opacity: 0 },
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
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <div className={styles.intro}>
          <motion.h2
            className={styles.mainTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Build. Connect. <span className={styles.accent}>Ship.</span>
          </motion.h2>
          <motion.p
            className={styles.mainSubtitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The infrastructure for student-led innovation.
          </motion.p>
        </div>

        <motion.div
          className={styles.featureGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 */}
          <motion.div className={styles.featureCard} variants={cardVariants}>
            <div className={styles.number}>01</div>
            <h3 className={styles.featureTitle}>The Campus Thread</h3>
            <p className={styles.featureDesc}>
              Every college gets a dedicated thread. Join <code>/iitb</code>, <code>/mit</code>, or <code>/stanford</code> to
              find localized opportunities that don't exist anywhere else.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div className={styles.featureCard} variants={cardVariants}>
            <div className={styles.number}>02</div>
            <h3 className={styles.featureTitle}>Dynamic Team Sourcing</h3>
            <p className={styles.featureDesc}>
              Need a researcher? A UI designer? Or a co-founder? Filter your campus thread by
              expertise and interest to build a team in minutes.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div className={styles.featureCard} variants={cardVariants}>
            <div className={styles.number}>03</div>
            <h3 className={styles.featureTitle}>Project Showcasing</h3>
            <p className={styles.featureDesc}>
              Upload your work-in-progress or finished products. Get feedback from your peers
              and find contributors who are as passionate as you are.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;