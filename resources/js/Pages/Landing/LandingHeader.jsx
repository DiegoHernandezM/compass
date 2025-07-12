import React from 'react';

const LandingHeader = (props) => {
  return (
    <header className="landing-header">
      <h1>{props.content.main_title}</h1>
      <a href="/login" className="login-link">{props.content.login_button}</a>
    </header>
  );
};

export default LandingHeader;
