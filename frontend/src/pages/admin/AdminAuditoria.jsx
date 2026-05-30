import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import styles from './AdminAuditoria.module.css'

export default function AdminAuditoria() {
  const [general, setGeneral] = useState(null)
  const [eleccionSeleccionada, setEleccionSeleccionada] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [loadingGeneral, setLoadingGeneral] = useState(true)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    api.get('auditoria/general/')
      .then(res => {
        setGeneral(res.data)
        if (res.data.reporte.length > 0) {
          setEleccionSeleccionada(res.data.reporte[0].eleccion_id)
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingGeneral(false))
  }, [])

  useEffect(() => {
    if (!eleccionSeleccionada) return
    setLoadingDetalle(true)
    api.get(`auditoria/eleccion/${eleccionSeleccionada}/`)
      .then(res => setDetalle(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingDetalle(false))
  }, [eleccionSeleccionada])

  const estadoClass = (estado) => {
    if (estado === 'activa') return styles.estadoActiva
    if (estado === 'cerrada') return styles.estadoCerrada
    return styles.estadoBorrador
  }

  return (
    <AdminLayout>
      <div className={styles.header}>
        <h2 className={styles.titulo}>Auditoría Electoral</h2>
        <p className={styles.subtitulo}>Consulta métricas y trazabilidad de los procesos electorales</p>
      </div>

      {/* Reporte general */}
      <div className={styles.sectionTitle}>
        <span className={styles.dot}></span>
        Reporte general
      </div>

      {loadingGeneral ? (
        <div className={styles.loading}>Cargando reporte...</div>
      ) : general && (
        <>
          <div className={styles.statCardTop}>
            <div className={styles.statNum}>{general.total_elecciones}</div>
            <div className={styles.statLabel}>Total de elecciones registradas</div>
          </div>

          <div className={styles.tabla}>
            <div className={styles.tablaHeader}>
              <span>Elección</span>
              <span>Estado</span>
              <span>Habilitados</span>
              <span>Votos</span>
              <span>Participación</span>
            </div>
            {general.reporte.map((r, i) => (
              <div
                key={i}
                className={`${styles.tablaRow} ${eleccionSeleccionada === r.eleccion_id ? styles.rowSelected : ''}`}
                onClick={() => setEleccionSeleccionada(r.eleccion_id)}
              >
                <span className={styles.rowNombre}>{r.eleccion}</span>
                <span><span className={`${styles.estado} ${estadoClass(r.estado)}`}>{r.estado}</span></span>
                <span className={styles.rowValor}>{r.total_habilitados}</span>
                <span className={styles.rowValor}>{r.total_votos}</span>
                <span className={styles.rowValor}>{r.participacion}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Detalle por elección */}
      <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>
        <span className={styles.dot}></span>
        Detalle por elección
      </div>

      {loadingDetalle ? (
        <div className={styles.loading}>Cargando detalle...</div>
      ) : detalle && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{detalle.total_votantes_habilitados}</div>
              <div className={styles.statLabel}>Habilitados</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{detalle.total_votos_emitidos}</div>
              <div className={styles.statLabel}>Votos emitidos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{detalle.total_sin_votar}</div>
              <div className={styles.statLabel}>Sin votar</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNum}>{detalle.participacion_porcentaje}%</div>
              <div className={styles.statLabel}>Participación</div>
            </div>
          </div>

          <div className={styles.lista}>
            {detalle.detalle_por_candidato.map((c, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemNombre}>
                    {i === 0 && '🥇 '}{i === 1 && '🥈 '}{i === 2 && '🥉 '}
                    {c.candidato}
                  </span>
                  <span className={styles.itemPct}>{c.porcentaje}%</span>
                </div>
                <div className={styles.barraBg}>
                  <div className={styles.barraFill} style={{ width: `${c.porcentaje}%` }}></div>
                </div>
                <div className={styles.itemVotos}>{c.votos} votos</div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  )
}