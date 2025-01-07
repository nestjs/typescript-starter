import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const privateKey: string = `-----BEGIN PUBLIC KEY----- IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1CJH/6Muaj+sLgaw8Agd69Usr0IzIgDK6KKK5s8FCyltnremx9oEmceAdfZU9E8DZeX+eH6t+p/cQ8o/5Yv8ROk/zsCGKcTZWGWa8a6OYFN31guTLo+iEqGT3B+PI9/NmxWpy1ka+WF4d2Zg1H5SuQoD4EwReHLSkJ/RqFQLwwF8aEcIi/DsEzv12b+MCpqoVlV1Xg0lhGwSTUdnDB6xCOEAJBPg2G95LqchEARllOc0SQ7z6FtwlRhANp5CYfgFIrjzZrURYVz5cC+DwB/UC2CmzkSOVmgbQg4MEFV6hox6UMb57nWDAuAKGiq8RuKN9x11OLCtOavRRIwQPSwt8QIDAQAB -----END PUBLIC KEY-----`;
const publicKey: string = `-----BEGIN PRIVATE KEY----- IIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDUIkf/oy5qP6wuBrDwCB3r1SyvQjMiAMrooormzwULKW2et6bH2gSZx4B19lT0TwNl5f54fq36n9xDyj/li/xE6T/OwIYpxNlYZZrxro5gU3fWC5Muj6ISoZPcH48j382bFanLWRr5YXh3ZmDUflK5CgPgTBF4ctKQn9GoVAvDAXxoRwiL8OwTO/XZv4wKmqhWVXVeDSWEbBJNR2cMHrEI4QAkE+DYb3kupyEQBGWU5zRJDvPoW3CVGEA2nkJh+AUiuPNmtRFhXPlwL4PAH9QLYKbORI5WaBtCDgwQVXqGjHpQxvnudYMC4AoaKrxG4o33HXU4sK05q9FEjBA9LC3xAgMBAAECggEALSRbanLVBH6muweo/PdZOK+dSfFeNLjy9QTr5ph81AZ9oZYmy2YhbwEVnOSt6OxshnFmUMlyaAA/TPy70rMSnK5/KdXt5vMRJl6+1XnmKejxOi8t461kma7hKmlb2lA8rmkygAem9hUwH8Z9ShLUszRGpWNCn31dwjGEWdwCwb0Ku2LSrpNKssinANwWKvz8sqHdEQHp8G1gu3L2XMEyV7FM/BKWCNmzVVI1zSBQnTusTYjvQrTn7yRasY4Q63r0r0oVXXydT6CioobtxKiqvH49czkvdSIZIVp1GOUtgpydf/R2jCoCAI64lslZyygKdhXckHT4YgVhbD86stba/QKBgQDwgu2hvjggydICbCzjOY75N6nw5DS1D5U6m8/w5GlZLrf3vgE2iYFWj2k+3e9d6zkMTCGupMpHbVbVeXK9Jf0xPIISRgrnruGhWHB7N7yLnVprcg750Ra6Uww/sAtxjXCVjl9bJV6ZsFjjv7SH4ZAwbJ86em8ormTPpU76ymZM1QKBgQDhy4VkFF7nRPcZobGSHPpOd7p/QFvchIJ0yxMVjTsUelMXvy+yvVRGXs0xU9wodbjwlvxos9p2r7W+1I9pI6j+KO8ng1tsUjWMj5oO/OoClgzqIVDJCVyzF5v7aErDCQfYucJ6j9OLtY4zU5MeaNcJhI7gMzUIrTjo6Yl+Dxo6rQKBgQDGfdeuX/WkoctvcmWNVeh4J4daJoyVTXoEN6lijq+fCZ6MmMQZhVw32v2qA7HUGhgn3QEDSD8kuckrPyMBlcOjCePzPtkrIjpWVU3nczVpKAECocxYQkZ2mamHOjwHiAp9c1WhPHMZdd+2fnV4myDLximXMopg0aSjdjN7aOUKzQKBgG3rReSShiDP0fsIXAllUfUhFAkeq5mOaHOy6Hd1aW1un0TQLcg1ovEe9YUt7d9Eb+OvnPDbnV5p63AayjXExl/0TXhO2hLBcpAa2ESzmrfnlCHmVg2IITiOJcEd5EdN/iPjSmmf2rwIhlE2PkhvgT+A6Iz8YLT4ntvD1MspTvuBAoGAM52ncQFg5vQXuNbE+40PgsrHUJwYJJPJXlqBRGTEADDm3ycQq53eqb1OhfmYwqHm57+H+e/Dhig/a99NdzB0fGMFkt33tStCgjY5lfDBM+1lATDV5gBXtPaJnYsmMpOir2uKmBQY9HY+fbTudEhr42l8zUFCtf78EcdYVkCCIRY= -----END PRIVATE KEY-----`;
const uuid: string = `238684ef-eff3-4104-8e1a-b66744a62afc`;

async function main() {
  await prisma.user.createMany({
    data: [
      {
        public_key: publicKey,
        private_key: privateKey,
        favs: ['1', '2'],
        user_id: uuid,
      },
    ],
  });
}

main()
  .then(() => {
    console.log('Seed data created');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
