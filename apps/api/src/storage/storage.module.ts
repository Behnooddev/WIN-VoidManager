import { Global, Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';
import { StorageProvider } from './storage.provider';

@Global()
@Module({
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useClass: LocalStorageProvider,
    },
  ],
  exports: ['STORAGE_PROVIDER'],
})
export class StorageModule {}
