import React from 'react';
import styles from '../styles/features.module.css';

const Features = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <h2 className={styles.mainTitle}>Build. Connect. <span className={styles.accent}>Ship.</span></h2>
          <p className={styles.mainSubtitle}>The infrastructure for student-led innovation.</p>
        </div>

        <div className={styles.featureList}>
          {/* Feature 1 */}
          <div className={styles.featureItem}>
            <div className={styles.number}>01</div>
            <div className={styles.textSide}>
              <h3 className={styles.featureTitle}>The Campus Thread</h3>
              <p className={styles.featureDesc}>
                Every college gets a dedicated thread. Join <code>/iitb</code>, <code>/mit</code>, or <code>/stanford</code> to 
                find localized opportunities that don't exist anywhere else.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureItem}>
            <div className={styles.number}>02</div>
            <div className={styles.textSide}>
              <h3 className={styles.featureTitle}>Dynamic Team Sourcing</h3>
              <p className={styles.featureDesc}>
                Need a researcher? A UI designer? Or a co-founder? Filter your campus thread by 
                expertise and interest to build a team in minutes, not weeks.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureItem}>
            <div className={styles.number}>03</div>
            <div className={styles.textSide}>
              <h3 className={styles.featureTitle}>Project Showcasing</h3>
              <p className={styles.featureDesc}>
                Upload your work-in-progress or finished products. Get feedback from your peers 
                and find contributors who are as passionate as you are.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;