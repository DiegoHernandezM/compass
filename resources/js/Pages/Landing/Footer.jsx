import React from 'react';

const Footer = (props) => {
  return (
    <section className="features-section">
      <h3>{props.content.lower_title}</h3>
      <div className="features-grid">
        <div className="feature-item">
          <div className="icon">📋</div>
          <p>{props.content.lower_text_1}</p>
        </div>
        <div className="feature-item">
          <div className="icon">✅</div>
          <p>{props.content.lower_text_2}</p>
        </div>
        <div className="feature-item">
          <div className="icon">🔍</div>
          <p>{props.content.lower_text_3}</p>
        </div>
        <div className="feature-item">
          <div className="icon">📊</div>
          <p>{props.content.lower_text_4}</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
