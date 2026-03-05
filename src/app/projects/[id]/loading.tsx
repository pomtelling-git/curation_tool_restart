import styles from './loading.module.scss'

export default function ProjectLoading() {
  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <div className={styles.back} aria-hidden />
        <div className={styles.projectName}>
          <div className={styles.label} aria-hidden />
          <div className={styles.title} aria-hidden />
        </div>
        <div className={styles.meta} aria-hidden />
      </div>
      <div className={styles.main}>
        <div className={styles.dropZone} aria-hidden />
        <div className={styles.gallery} role="presentation">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.card}>
              <div className={styles.cardImage} aria-hidden />
              <div className={styles.cardMeta}>
                <div className={styles.cardLine} aria-hidden />
                <div className={styles.cardLineShort} aria-hidden />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
