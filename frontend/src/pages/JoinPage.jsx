import React, { useEffect } from 'react';
import JoinThread from '../sections/JoinThread'; // Assuming you kept it in sections

const JoinPage = () => {
  // Scroll to top when this page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <JoinThread />
    </>
  );
};

export default JoinPage;