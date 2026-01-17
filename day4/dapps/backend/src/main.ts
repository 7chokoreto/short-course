import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ⭐ Setup Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Avalanche dApp Backend API')
    .setDescription('Backend API untuk membaca data blockchain - Day 4 Avalanche Indonesia Short Course - Muhammad Daffa Fahriyah (NIM: 231011400530)')
    .setVersion('1.0')
    .setContact(
      'Muhammad Daffa Fahriyah',  // ⭐ GANTI dengan nama kamu
      '',
      'email@example.com'
    )
    .addTag('blockchain', 'Endpoint untuk interaksi dengan smart contract')
    .addTag('info', 'Informasi mahasiswa')
    .setExternalDoc('Dokumentasi Tambahan', 'https://docs.nestjs.com')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // ⭐ Setup Swagger UI dengan CSS yang lebih bagus
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Avalanche dApp API - Muhammad Daffa Fahriyah (NIM: 231011400530)', // ⭐ GANTI
    customCss: `
      /* Topbar styling */
      .swagger-ui .topbar { 
        background-color: #E84142; 
        padding: 10px 0;
      }
      .topbar-wrapper img { 
        content: url('https://avatars.githubusercontent.com/u/44205799?s=200&v=4'); 
      }
      
      /* Info section - FIX untuk text yang ga kebaca */
      .swagger-ui .information-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px;
        border-radius: 10px;
        margin: 20px 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .info {
        margin: 0;
      }
      
      .swagger-ui .info .title {
        color: #ffffff !important;
        font-size: 36px !important;
        font-weight: bold;
        margin-bottom: 10px;
      }
      
      .swagger-ui .info .description {
        color: #ffffff !important;
        font-size: 16px !important;
        line-height: 1.6;
      }
      
      .swagger-ui .info a {
        color: #ffd700 !important;
        text-decoration: underline;
      }
      
      .swagger-ui .info .base-url {
        color: #ffffff !important;
      }
      
      /* Scheme container */
      .swagger-ui .scheme-container {
        background: #fafafa;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      
      /* Operations styling */
      .swagger-ui .opblock-tag {
        font-size: 20px;
        font-weight: bold;
        color: #3b4151;
        border-bottom: 2px solid #E84142;
        padding: 10px 0;
        margin: 20px 0;
      }
      
      .swagger-ui .opblock {
        border-radius: 8px;
        margin: 10px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .swagger-ui .opblock.opblock-get {
        border-color: #49cc90;
        background: rgba(73, 204, 144, 0.1);
      }
      
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: #49cc90;
      }
      
      /* Parameter table */
      .swagger-ui table thead tr td,
      .swagger-ui table thead tr th {
        color: #3b4151 !important;
        font-weight: bold;
      }
      
      /* Response styling */
      .swagger-ui .responses-inner h4,
      .swagger-ui .responses-inner h5 {
        color: #3b4151 !important;
      }
      
      /* Custom info badge untuk NIM */
      .info-container::after {
        content: "NIM: 12345678";
        display: inline-block;
        background: #ffd700;
        color: #333;
        padding: 5px 15px;
        border-radius: 20px;
        font-weight: bold;
        margin-left: 15px;
        font-size: 14px;
      }
    `,
    customfavIcon: 'https://avatars.githubusercontent.com/u/44205799?s=200&v=4',
  });

  await app.listen(3000);
  console.log('🚀 Backend berjalan di http://localhost:3000');
  console.log('📚 Swagger UI tersedia di http://localhost:3000/api');
  console.log('');
  console.log('========================================');
  console.log('   Muhammad Daffa Fahriyah - NIM: 231011400530'); // ⭐ GANTI
  console.log('   Avalanche Indonesia Short Course');
  console.log('========================================');
}
bootstrap();