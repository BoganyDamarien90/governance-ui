import { useWallet as useHubsWallet } from '@hub/hooks/useWallet'
import { DEFAULT as HUBS_WALLET_CONTEXT_DEFAULT } from '@hub/providers/Wallet'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { createContext, FC } from 'react'
import useWalletStore from 'stores/useWalletStore'

export const context = createContext(HUBS_WALLET_CONTEXT_DEFAULT)

type Props = {
  appKind: 'governance' | 'hub'
  children?: React.ReactNode
}

const SharedWalletApiProvider: FC<Props> = ({ appKind, children }) =>
  appKind === 'governance' ? (
    <GovernanceSharedWalletApiProvider>
      {children}
    </GovernanceSharedWalletApiProvider>
  ) : (
    <HubsSharedWalletApiProvider>{children}</HubsSharedWalletApiProvider>
  )

const HubsSharedWalletApiProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const value = useHubsWallet()
  return <context.Provider value={value}>{children}</context.Provider>
}

const GovernanceSharedWalletApiProvider: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const wallet = useWalletStore((s) => s.current)

  const value = !wallet
    ? HUBS_WALLET_CONTEXT_DEFAULT
    : {
        publicKey: wallet.publicKey ?? undefined,
        // It's stupid that TS requires this to be explicitly generically typed >:-(
        signAllTransactions: async <
          T extends Transaction | VersionedTransaction
        >(
          x: T[]
        ) => wallet.signAllTransactions(x),
        signTransaction: async (x) => wallet.signTransaction(x),
        connect: HUBS_WALLET_CONTEXT_DEFAULT.connect, // governance side has no analogue for this?
        signMessage: HUBS_WALLET_CONTEXT_DEFAULT.signMessage, // governance side has no analogue for this?
      }

  return <context.Provider value={value}>{children}</context.Provider>
}

export default SharedWalletApiProvider