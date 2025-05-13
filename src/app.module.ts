import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { QrcodeModule } from './qrcode/qrcode.module';
import { RemindersModule } from './reminders/reminders.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { UploadsModule } from './uploads/uploads.module';
import { PdfModule } from './pdf/pdf.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { RolesModule } from './roles/roles.module';
import { CacheModule } from './cache/cache.module';
import { ThrottlerModule } from './throttler/throttler.module';
import { I18nModule } from './i18n/i18n.module';
import { LoggingModule } from './logging/logging.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    UsersModule,
    EventsModule,
    QrcodeModule,
    RemindersModule,
    PaymentsModule,
    AuthModule,
    MailerModule,
    UploadsModule,
    PdfModule,
    WebsocketsModule,
    AdminModule,
    AnalyticsModule,
    SearchModule,
    RolesModule,
    CacheModule,
    ThrottlerModule,
    I18nModule,
    LoggingModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, NotificationsGateway],
})
export class AppModule {}
