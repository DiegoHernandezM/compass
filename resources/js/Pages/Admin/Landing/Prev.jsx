import '../../../Components/LandingPage.css';
import LandingHeaderPrev from './Partials/LandingHeaderPrev';
import IntroSectionPrev from './Partials/IntroSectionPrev';
import FooterPrev from './Partials/FooterPrev';

export default function Prev({ content }) {
  return (
    <div className="landing-container">
      <LandingHeaderPrev content={content}/>
      <IntroSectionPrev content={content}/>
      <FooterPrev content={content}/>
    </div>
  );
}
