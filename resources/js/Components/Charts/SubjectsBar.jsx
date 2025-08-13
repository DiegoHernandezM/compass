import {
  ResponsiveContainer,
  BarChart, Bar,
  CartesianGrid, XAxis, YAxis,
  Tooltip, Legend
} from 'recharts';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function SubjectsBar({ subjectsChart = [] }) {
  if (!subjectsChart.length) return null;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Materias con mejor puntaje (% acierto promedio)
        </Typography>
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectsChart}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value, name) => name === 'percent' ? `${value}%` : value} />
              <Legend />
              {/* barra principal: porcentaje */}
              <Bar dataKey="percent" name="% acierto" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              {/* opcional: una barra “fantasma” muy tenue con total de correctos para comparar */}
              {/* <Bar dataKey="correct" name="Aciertos" fill="#22c55e" radius={[6,6,0,0]} /> */}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
