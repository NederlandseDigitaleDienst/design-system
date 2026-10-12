import markup from './page-structure.html?raw';
import header from './page-structure.header.html?raw';
import headerHome from './page-structure.header-home.html?raw';
import headerLogin from './page-structure.header-login.html?raw';
import headerAccount from './page-structure.header-account.html?raw';
import headerStatus from './page-structure.header-status.html?raw';
import footer from './page-structure.footer.html?raw';
import footerHome from './page-structure.footer-home.html?raw';
import { patternStory } from '../pattern-story.js';

export default {
	title: "Patronen/Pagina's/Paginaopbouw",
};

export const Standaard = patternStory(markup, undefined, 640);

export const Header = patternStory(header, undefined, 320);

export const HeaderHome = patternStory(headerHome, undefined, 320);

export const HeaderLogin = patternStory(headerLogin, undefined, 320);

export const HeaderAccount = patternStory(headerAccount, undefined, 320);

export const HeaderStatus = patternStory(headerStatus, undefined, 320);

export const Footer = patternStory(footer, undefined, 560);

export const FooterHome = patternStory(footerHome, undefined, 480);
