import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const initialChords = async (scales, tonic, dissonance) => {
  const res = await instance.post('/initial-chords', {
    scales,
    tonic,
    dissonance,
  });
  return res.data;
}

const generateChords = async (scales, prev, force) => {
  const res = await instance.post('/generate-chords', {
    scales,
    prev,
    force,
  });
  return res.data;
}

const scales = async () => {
  const res = await instance.get('/scales');
  return res.data;
}

export default {
  initialChords,
  generateChords,
  scales,
}