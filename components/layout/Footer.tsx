import Link from "next/link";
import { site } from "@/lib/config/site";

export function Footer() {
  return (
    <footer className="atelier-footer">
      <div className="footer-intro"><p>Facial jewelry.<br /><em>Personal by design.</em></p><Link className="text-link" href="/commission">Begin a commission <span aria-hidden="true">↗</span></Link></div>
      <div className="footer-information">
        <nav aria-label="Footer"><p className="label-xs">Explore</p><ul>{site.nav.map(item=><li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}<li><Link href="/cart">Bag &amp; selection</Link></li></ul></nav>
        <div><p className="label-xs">Designed around you</p><p>Choose a design or commission your own. Explore the placement in Face Studio.</p><p>Your photo stays on this device. Try-on is an approximate visual guide, not a fitting.</p></div>
        <div><p className="label-xs">Before the first release</p><p>Design renders show proposed pieces. Materials, dimensions and compatibility remain subject to confirmation.</p><p>Orders are not open yet.</p></div>
      </div>
      <p className="footer-wordmark" aria-label="DERMAL">DERMAL</p>
      <div className="footer-colophon"><span>Unconventional facial jewelry</span><span>Symbols. Objects. Originals.</span><span>DERMAL</span></div>
    </footer>
  );
}
