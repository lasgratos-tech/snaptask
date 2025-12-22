import { LedgerService } from '../../domain/ledger/ledger.service';

export async function ledgerBootstrap(request, reply) {
  if (!request.user?.owner) {
    return;
  }

  await LedgerService.ensureAccount(request.user.owner);
}
