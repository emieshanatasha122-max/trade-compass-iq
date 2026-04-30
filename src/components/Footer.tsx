import { Mail, MapPin, Phone, Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="mt-10 border-t border-border bg-card/40 px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 md:items-start">
        
        {/* Left: Logos + Department */}
        <div className="flex items-start gap-4 md:justify-self-end md:mr-6">
          
          {/* Logos */}
          <div className="flex items-center gap-3">
            <img
              src="/jata-negara.png"
              alt="Jata Negara"
              className="h-14 w-auto"
            />

            <div className="h-9 w-px bg-border" />

            <img
              src="/nbdac-logo.png"
              alt="NBDAC Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Text */}
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {lang === 'bm'
                ? 'Jabatan Perangkaan Malaysia'
                : 'Department of Statistics Malaysia'}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {lang === 'bm'
                ? 'Pusat Analitik Data Raya Negara'
                : 'National Big Data Analytics Centre'}
            </p>
          </div>
        </div>

        {/* Right: Contact */}
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />

            <p>
              {lang === 'bm' ? (
                <>
                  Jabatan Perangkaan Malaysia,<br />
                  Blok C6 & C7, Kompleks C,<br />
                  Pusat Pentadbiran Kerajaan Persekutuan,<br />
                  62514 Presint 1,<br />
                  Wilayah Persekutuan Putrajaya
                </>
              ) : (
                <>
                  Department of Statistics Malaysia,<br />
                  Block C6 & C7, Complex C,<br />
                  Federal Government Administrative Centre,<br />
                  62514 Precinct 1,<br />
                  Wilayah Persekutuan Putrajaya
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-primary" />
            <span>03 8885 7000</span>
          </div>

          <div className="flex items-center gap-3">
            <Printer className="h-4 w-4 shrink-0 text-primary" />
            <span>03 8888 9248</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            <span>info@dosm.gov.my</span>
          </div>
        </div>
      </div>
    </footer>
  );
}