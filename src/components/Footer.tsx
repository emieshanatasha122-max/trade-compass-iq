import { Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
      
      <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
        Contact
      </h2>

      <div className="mt-4 space-y-3">

        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 mt-1 text-primary" />
          <p>
            Department of Statistics Malaysia,<br />
            Block C6 & C7, Complex C,<br />
            Federal Government Administrative Centre,<br />
            62514 Putrajaya
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-primary" />
          <p>+603-8885 7000</p>
        </div>

        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-primary" />
          <p>info@dosm.gov.my</p>
        </div>

        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-primary" />
          <a
            href="https://www.dosm.gov.my"
            target="_blank"
            className="hover:underline"
          >
            www.dosm.gov.my
          </a>
        </div>

      </div>
    </footer>
  );
}