import { LedgerRepository } from './ledger.repository.js'

export class LedgerService {
  private repo = new LedgerRepository()

  async write(input: Parameters<LedgerRepository['create']>[0]) {
    return this.repo.create(input)
  }
}
