// src/hooks/usePublicIp.ts
import { useState, useEffect } from 'react';
import {publicIpv4} from 'public-ip';

const usePublicIp = () => {
  const [ip, setIp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const ip = await publicIpv4()
        setIp(ip);
      } catch (err) {
        setError('Unable to fetch IP address');
      }
    };
    fetchIp();
  }, []);
  return { ip, error };
};
export default usePublicIp;
