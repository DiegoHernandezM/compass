import React from 'react';

const IntroSection = (props) => {
  return (
    <section className="landing-hero">
      <div className="hero-text">
        <h2>{props.content.subtitle}</h2>
        <p dangerouslySetInnerHTML={{ __html: props.content.principal_text }} />
        <a href="/register" className="cta-button" style={{ background: "#203764" }}>{props.content.subscribe_button}</a>

        <div className="compatibility">
          <span>{props.content.compatible_text}</span>
          <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" />
          <img src="https://img.icons8.com/ios-filled/50/000000/mac-os.png" alt="Apple" />
        </div>
      </div>
      <div className="hero-image">
        <video
          src={`/storage/${props.content.video_path}`}
          controls
          autoPlay
          muted
          loop
          playsInline
          className="mockup-video"
        />
      </div>
    </section>
  );
};

export default IntroSection;
