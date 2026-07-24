import dns from 'dns';
import { fetchUrl } from '../src/services/fetcher.service';

jest.mock('dns', () => {
  const originalDns = jest.requireActual('dns');
  return {
    ...originalDns,
    promises: {
      ...originalDns.promises,
      lookup: jest.fn().mockImplementation(async (hostname) => {
        if (hostname === 'rebinding-domain.com') {
          return { address: '192.168.1.1', family: 4 };
        }
        return { address: '8.8.8.8', family: 4 }; // fallback
      }),
    },
  };
});

describe('fetchUrl SSRF DNS-rebinding guard', () => {
  it('should block domains resolving to private IPs', async () => {
    await expect(fetchUrl('http://rebinding-domain.com')).rejects.toThrow(
      /Requests to local or private IP addresses are prohibited/
    );
  });
});
