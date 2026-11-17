import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deploymentConfig } from './deploy-ftp.mjs';
const credentials = { HOSTINGER_SFTP_HOST: 'ftp.example.test', HOSTINGER_SFTP_USER: 'test-user', HOSTINGER_SFTP_PASSWORD: 'test-password' };
test('requires explicit credentials', () => {
  assert.throws(() => deploymentConfig({}));
  assert.throws(() => deploymentConfig({ ...credentials, HOSTINGER_SFTP_PASSWORD: '' }));
});
test('always verifies TLS and never enables plaintext', () => {
  const config = deploymentConfig(credentials);
  assert.equal(config.secure, true);
  assert.equal(config.secureOptions.rejectUnauthorized, true);
  assert.equal(config.secureOptions.servername, credentials.HOSTINGER_SFTP_HOST);
  assert.equal(config.secureOptions.minVersion, 'TLSv1.2');
});
test('requires a verified certificate hostname for IP endpoints', () => {
  assert.throws(() => deploymentConfig({ ...credentials, HOSTINGER_SFTP_HOST: '192.0.2.1' }));
  assert.equal(deploymentConfig({ ...credentials, HOSTINGER_SFTP_HOST: '192.0.2.1', HOSTINGER_FTP_TLS_SERVERNAME: 'ftp.example.test' }).secureOptions.servername, 'ftp.example.test');
});
