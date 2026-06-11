import styles from './layout.module.css';

export const metadata = {
  title: 'Admin Panel | Ketering',
  description: 'Admin panel za upravljanje narudžbinama',
};

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminLayout}>
      {children}
    </div>
  );
}
