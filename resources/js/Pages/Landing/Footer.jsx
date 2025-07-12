import React from 'react';

const Footer = (props) => {
  return (
    <section className="features-section">
      <h3>{props.content.lower_title}</h3>
      <div className="features-grid">
        <div className="feature-item">
          <div className="icon">
            <img src="/assets/note.gif" alt="icono de registro" style={{ height: "60px" }} />
          </div>
          <p>{props.content.lower_text_1}</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <img src="/assets/success.gif" alt="icono de registro" style={{ height: "60px" }} />
          </div>
          <p>{props.content.lower_text_2}</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <img src="/assets/search.gif" alt="icono de registro" style={{ height: "60px" }} />
          </div>
          <p>{props.content.lower_text_3}</p>
        </div>
        <div className="feature-item">
          <div className="icon">
            <img src="/assets/analytics.gif" alt="icono de registro" style={{ height: "60px" }} />
          </div>
          <p>{props.content.lower_text_4}</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
