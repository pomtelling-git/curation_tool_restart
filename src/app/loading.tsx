import styles from './loading.module.scss'

export default function Loading() {
  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.label} aria-hidden />
        <div className={styles.button} aria-hidden />
      </div>
      <div className={styles.list}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.row} aria-hidden />
        ))}
      </div>
    </div>
  )
}
