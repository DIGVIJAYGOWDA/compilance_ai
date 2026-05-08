import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  active:   { label: 'license.active',   cls: 'badge-green' },
  expiring: { label: 'license.expiring', cls: 'badge-amber' },
  expired:  { label: 'license.expired',  cls: 'badge-red'   },
  unknown:  { label: 'license.unknown',  cls: 'badge-gray'  },
};

export default function StatusBadge({ status = 'unknown', large = false }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
  return (
    <span className={`${cfg.cls} ${large ? 'text-sm px-4 py-1.5' : ''} whitespace-nowrap`}>
      {t(cfg.label)}
    </span>
  );
}
