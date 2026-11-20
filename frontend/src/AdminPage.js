import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, Btn, Input, Divider, StatusBadge, StarRating } from './components';

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function bookingDateKey(bookedAt) {
  if (!bookedAt) return null;
  const timestamp = typeof bookedAt === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(bookedAt)
    ? `${bookedAt.replace(' ', 'T')}Z`
    : bookedAt;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : dateKey(date);
}

export default function AdminPage() {
  const { doctors, appointments, patients, sendAppointmentReminder } = useApp();
  const [search, setSearch] = useState('');
  const [remindSent, setRemindSent] = useState({});
  const [remindErrors, setRemindErrors] = useState({});

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const now = new Date();
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const pendingCount = pendingAppointments.length;
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const dateAppointments = appointments.filter(appt => bookingDateKey(appt.bookedAt) === dateKey(date));
    const patientIds = new Set(
      dateAppointments
        .map(appt => appt.patientId ?? appt.patientName)
        .filter(Boolean)
        .map(String)
    );
    return {
      date,
      label: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      appointments: dateAppointments.length,
      patients: patientIds.size,
    };
  });
  const chartMax = Math.max(4, Math.ceil(Math.max(...dailyActivity.map(day => Math.max(day.appointments, day.patients))) / 4) * 4);
  const chart = { left: 38, top: 16, width: 666, height: 150 };
  const chartBottom = chart.top + chart.height;
  const groupWidth = chart.width / dailyActivity.length;
  const barWidth = 22;
  const barGap = 7;

  const handleRemindDoctor = async (appt) => {
    try {
      await sendAppointmentReminder(appt.id);
      setRemindSent(prev => ({ ...prev, [appt.id]: true }));
      setRemindErrors(prev => ({ ...prev, [appt.id]: '' }));
    } catch (e) {
      console.error('Failed to remind doctor', e);
      setRemindErrors(prev => ({ ...prev, [appt.id]: e.message }));
    }
  };

  const doctorInsights = doctors.map(d => {
    const doctorAppointments = appointments.filter(a => a.doctorId === d.id);
    const ratingCount = d.ratingCount || 0;
    const avgRating = ratingCount ? (d.ratingSum / ratingCount).toFixed(1) : 'N/A';
    return {
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      booked: doctorAppointments.length,
      rating: avgRating,
      reviews: doctorAppointments.filter(a => a.rating).length,
    };
  });

  return (
    <div className="admin-dashboard" style={{ animation:'fadeIn 0.35s ease' }}>
      <div className="admin-dashboard__header">
        <div>
          <h1 style={{ fontSize:28, marginBottom:6 }}>Admin Dashboard</h1>
          <p style={{ color:'var(--text-light)', fontSize:14 }}>A clear overview of bookings, patients, doctors, and reviews.</p>
        </div>
      </div>

      <div className="admin-dashboard__chart">
        <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px' }}>
          <h2 style={{ fontSize:18, marginBottom:4 }}>Daily Booking Activity</h2>
          <p style={{ color:'var(--text-light)', fontSize:13, marginBottom:14 }}>Appointments booked and unique patients over the last 7 days.</p>
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:8, fontSize:12, color:'var(--text-light)' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
              <span aria-hidden="true" style={{ width:10, height:10, borderRadius:2, background:'var(--teal)' }} />
              Appointments booked
            </span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:7 }}>
              <span aria-hidden="true" style={{ width:10, height:10, borderRadius:2, background:'var(--gold)' }} />
              Unique patients
            </span>
          </div>
          <div className="admin-dashboard__chart-scroll">
            <svg
              viewBox="0 0 720 220"
              role="img"
              aria-label="Appointments booked and unique patients by day for the last seven days"
              style={{ display:'block', width:'100%', height:'auto', overflow:'visible' }}
            >
              {Array.from({ length: 5 }, (_, index) => {
                const value = chartMax * (1 - index / 4);
                const y = chart.top + chart.height * index / 4;
                return (
                  <g key={index}>
                    <line x1={chart.left} y1={y} x2={chart.left + chart.width} y2={y} stroke="var(--surface-border)" />
                    <text x={chart.left - 10} y={y + 4} textAnchor="end" fill="var(--text-light)" fontSize="11">{Math.round(value)}</text>
                  </g>
                );
              })}
              {dailyActivity.map((day, index) => {
                const groupCenter = chart.left + groupWidth * (index + 0.5);
                const appointmentsHeight = day.appointments / chartMax * chart.height;
                const patientsHeight = day.patients / chartMax * chart.height;
                const barX = groupCenter - (barWidth * 2 + barGap) / 2;
                return (
                  <g key={day.label + index}>
                    <rect
                      x={barX}
                      y={chartBottom - appointmentsHeight}
                      width={barWidth}
                      height={appointmentsHeight}
                      rx="3"
                      fill="var(--teal)"
                    >
                      <title>{day.appointments} appointments booked</title>
                    </rect>
                    <rect
                      x={barX + barWidth + barGap}
                      y={chartBottom - patientsHeight}
                      width={barWidth}
                      height={patientsHeight}
                      rx="3"
                      fill="var(--gold)"
                    >
                      <title>{day.patients} unique patients</title>
                    </rect>
                    <text x={groupCenter} y="200" textAnchor="middle" fill="var(--text-light)" fontSize="11">{day.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Card>
      </div>

      <div className="admin-dashboard__metrics">
        <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px' }}>
          <div style={{ fontSize:12, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Total Patients</div>
          <div style={{ fontSize:28, fontWeight:700 }}>{patients.length}</div>
        </Card>
        <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px' }}>
          <div style={{ fontSize:12, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Total Doctors</div>
          <div style={{ fontSize:28, fontWeight:700 }}>{doctors.length}</div>
        </Card>
      </div>

      <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px', marginBottom:20 }}>
          <h2 style={{ fontSize:18, marginBottom:4 }}>Pending Bookings</h2>
          <p style={{ color:'var(--text-light)', fontSize:13, marginBottom:14 }}>{pendingCount} appointment{pendingCount !== 1 ? 's' : ''} awaiting doctor approval.</p>
          {pendingCount === 0 ? (
            <p style={{ color:'var(--text-light)', fontSize:13 }}>There are no pending appointments.</p>
          ) : (
          <div style={{ display:'grid', gap:12 }}>
            {pendingAppointments.map(appt => (
              <div key={appt.id} style={{ padding:'14px 16px', borderRadius:12, background:'var(--card-bg)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <span style={{ fontSize:15, fontWeight:600 }}>{appt.patientName || 'Unknown Patient'}</span>
                      <StatusBadge status="pending" />
                    </div>
                    <div className="admin-dashboard__appointment-details" style={{ fontSize:13, color:'var(--text-light)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 16px' }}>
                      <span>Doctor: <strong style={{ color:'var(--white)' }}>{appt.doctorName || 'Unknown'}</strong></span>
                      <span>Specialty: <strong style={{ color:'var(--white)' }}>{appt.doctorSpecialty || '—'}</strong></span>
                      <span>Date: <strong style={{ color:'var(--white)' }}>{appt.date || '—'}</strong></span>
                      <span>Time: <strong style={{ color:'var(--white)' }}>{appt.slot || '—'}</strong></span>
                      {appt.reason && <span style={{ gridColumn:'1/-1' }}>Reason: <strong style={{ color:'var(--white)' }}>{appt.reason}</strong></span>}
                      {appt.patientPhone && <span>Phone: <strong style={{ color:'var(--white)' }}>{appt.patientPhone}</strong></span>}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
                    <Btn
                      variant={remindSent[appt.id] ? 'success' : 'outline'}
                      small
                      disabled={!!remindSent[appt.id]}
                      onClick={() => handleRemindDoctor(appt)}
                    >
                      {remindSent[appt.id] ? '✓ Reminder sent' : '🔔 Remind doctor'}
                    </Btn>
                    {remindErrors[appt.id] && (
                      <span role="alert" style={{ maxWidth:220, color:'var(--danger)', fontSize:12, textAlign:'right' }}>
                        {remindErrors[appt.id]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
      </Card>

      <div className="admin-dashboard__columns">
        <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px' }}>
          <div style={{ marginBottom:14 }}>
            <div>
              <h2 style={{ fontSize:18, marginBottom:4 }}>Doctor Demand</h2>
              <p style={{ color:'var(--text-light)', fontSize:13 }}>Most requested specialties and booked slots.</p>
            </div>
          </div>
          <div style={{ display:'grid', gap:14 }}>
            {doctorInsights.map(doc => (
              <div key={doc.id} style={{ padding:'14px 16px', borderRadius:12, background:'var(--card-bg)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:14, alignItems:'center' }}>
                  <div>
                    <h3 style={{ fontSize:15, marginBottom:4 }}>{doc.name}</h3>
                    <div style={{ fontSize:13, color:'var(--text-light)' }}>{doc.specialty}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700 }}>{doc.booked}</div>
                    <div style={{ fontSize:12, color:'var(--text-light)' }}>Booked</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, marginTop:12 }}>
                  <div style={{ fontSize:13, color:'var(--text-light)' }}>Reviews: {doc.reviews}</div>
                  <div style={{ fontSize:13, color:'var(--text-light)' }}>Rating: {doc.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px', minWidth:0 }}>
          <h2 style={{ fontSize:18, marginBottom:10 }}>Patient Search</h2>
          <Input label="Search patients" placeholder="Type patient name" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ maxHeight:660, overflowY:'auto', marginTop:10 }}>
            {filteredPatients.map(patient => (
              <div key={patient.id} style={{ padding:'12px 14px', borderRadius:10, background:'var(--card-bg)', border:'1px solid var(--border)', marginBottom:10, minWidth:0, overflow:'hidden' }}>
                <div style={{ fontSize:14, fontWeight:600, whiteSpace:'normal', wordBreak:'break-word', overflowWrap:'break-word' }}>{patient.name}</div>
                <div style={{ fontSize:12, color:'var(--text-light)' }}>Patient ID: {patient.id}</div>
              </div>
            ))}
            {!filteredPatients.length && <div style={{ padding:'18px', color:'var(--text-light)' }}>No patients found.</div>}
          </div>
        </Card>
      </div>

      <Divider label="Top Doctor Reviews" />
      <div className="admin-dashboard__reviews">
        {doctors.slice(0, 3).map(doc => (
          <Card key={doc.id} style={{ background:'var(--surface)', border:'1px solid var(--surface-border)', padding:'20px' }}>
            <h3 style={{ fontSize:16, marginBottom:10 }}>{doc.name}</h3>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <span style={{ fontSize:12, color:'var(--text-light)' }}>Rating</span>
              <strong style={{ fontSize:18 }}>{doc.ratingCount ? (doc.ratingSum / doc.ratingCount).toFixed(1) : 'N/A'}</strong>
            </div>
            <StarRating value={doc.ratingCount ? Math.round(doc.ratingSum / doc.ratingCount) : 0} size={18} />
            <p style={{ color:'var(--text-light)', marginTop:14, fontSize:13 }}>Total reviews: {doc.ratingCount || 0}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
