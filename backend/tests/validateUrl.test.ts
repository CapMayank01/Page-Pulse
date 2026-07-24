import dns from 'dns';
import { isBlockedHost, validateAndSanitizeUrl } from '../src/utils/validateUrl';

describe('validateUrl SSRF guards', () => {
  it('should block 127.0.0.0/8 loopback range', () => {
    expect(isBlockedHost('127.0.0.2')).toBe(true);
    expect(isBlockedHost('127.1.1.1')).toBe(true);
    expect(isBlockedHost('127.255.255.254')).toBe(true);
  });

  it('should block 0.0.0.0/8 subnet', () => {
    expect(isBlockedHost('0.5.5.5')).toBe(true);
    expect(isBlockedHost('0.0.0.0')).toBe(true);
  });

  it('should block private IPv4 subnets', () => {
    expect(isBlockedHost('10.0.0.1')).toBe(true);
    expect(isBlockedHost('172.16.0.1')).toBe(true);
    expect(isBlockedHost('172.31.255.255')).toBe(true);
    expect(isBlockedHost('192.168.0.1')).toBe(true);
    expect(isBlockedHost('169.254.1.2')).toBe(true);
  });

  it('should block IPv6 loopback including bracketed hostname formats', () => {
    expect(isBlockedHost('[::1]')).toBe(true);
    expect(isBlockedHost('::1')).toBe(true);
    expect(isBlockedHost('[0:0:0:0:0:0:0:1]')).toBe(true);
    expect(isBlockedHost('0:0:0:0:0:0:0:1')).toBe(true);
  });

  it('should block IPv6 Unique Local and Link-Local subnets', () => {
    expect(isBlockedHost('[fc00::1]')).toBe(true);
    expect(isBlockedHost('fd00::dead:beef')).toBe(true);
    expect(isBlockedHost('[fe80::9999]')).toBe(true);
  });

  it('should allow clean public hostnames', () => {
    expect(isBlockedHost('google.com')).toBe(false);
    expect(isBlockedHost('8.8.8.8')).toBe(false);
  });
});
