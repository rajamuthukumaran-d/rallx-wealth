// src/components/NetWorth/Investments/SymbolRow.tsx
import Investment from '@/data/models/Investment';
import { formatCurrency } from '@/utils/currency';
import { effectiveCurrentValue } from '@/utils/investment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PurchaseRow } from './PurchaseRow';

type SymbolRowProps = {
  symKey: string;
  symInvestments: Investment[];
  type: string;
  showTopBorder: boolean;
  isExpanded: boolean;
  revealAnim: Animated.Value;
  onToggleReveal: () => void;
  onToggleExpand: () => void;
  toInr: (amount: number, currency?: string) => number;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function SymbolRow({
  symKey,
  symInvestments,
  type,
  showTopBorder,
  isExpanded,
  revealAnim,
  onToggleReveal,
  onToggleExpand,
  toInr,
}: SymbolRowProps) {
  const theme = useTheme();
  const router = useRouter();

  const isSolo = symKey.startsWith('__solo__');
  const isGrouped = !isSolo && symInvestments.length > 1;
  const rep = symInvestments[0];
  const mostRecent = isGrouped
    ? [...symInvestments].sort(
        (a, b) => (b.createdAt as number) - (a.createdAt as number),
      )[0]
    : rep;

  const totalQty = symInvestments.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const symCurrentValue = symInvestments.reduce(
    (s, i) => s + toInr(effectiveCurrentValue(i), i.currency),
    0,
  );
  const symInvested = symInvestments.reduce(
    (s, i) => s + toInr(i.investedAmount, i.currency),
    0,
  );
  const symGain = symCurrentValue - symInvested;
  const symGainColor = symGain >= 0 ? '#6dd58c' : theme.colors.error;
  const symGainPrefix = symGain >= 0 ? '+' : '';
  const symHasCurrentValue = symInvestments.some((i) => i.currentValue > 0);

  const actionWidth = isGrouped ? 136 : 204;
  const avatarText = rep.symbol
    ? rep.symbol.slice(0, 2).toUpperCase()
    : getInitials(rep.name);
  const displayName = rep.name + (rep.symbol && !isSolo ? ` (${rep.symbol})` : '');

  return (
    <View
      style={{
        borderTopWidth: showTopBorder ? 1 : 0,
        borderTopColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View style={{ overflow: 'hidden' }}>
        {/* Revealed action buttons */}
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: actionWidth,
            flexDirection: 'row',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              marginLeft: 8,
              overflow: 'hidden',
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                onToggleReveal();
                router.push({
                  pathname: '/(screens)/(net-worth)/(investments)/[id]',
                  params: {
                    id: 'new',
                    prefillName: mostRecent.name,
                    prefillSymbol: mostRecent.symbol ?? '',
                    prefillExchange: mostRecent.exchange ?? '',
                    prefillPlatform: mostRecent.platform ?? '',
                    prefillCurrency: mostRecent.currency ?? '',
                    prefillType: mostRecent.type,
                  },
                });
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backgroundColor: 'rgba(115,219,145,0.18)',
              }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={18} color="#73db91" />
              <Text style={{ color: '#73db91', fontSize: 11, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>

            {!isGrouped && (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  onToggleReveal();
                  router.push({
                    pathname: '/(screens)/(net-worth)/(investments)/[id]',
                    params: { id: rep.id },
                  });
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  backgroundColor: 'rgba(168,199,250,0.18)',
                }}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color="#a8c7fa" />
                <Text style={{ color: '#a8c7fa', fontSize: 11, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                onToggleReveal();
                router.push({
                  pathname: '/(screens)/(net-worth)/(investments)/sell',
                  params: {
                    symbol: rep.symbol ?? '',
                    name: rep.name,
                    investmentType: type,
                  },
                });
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backgroundColor: 'rgba(255,180,171,0.18)',
              }}
            >
              <MaterialCommunityIcons name="cash-remove" size={18} color="#ffb4ab" />
              <Text style={{ color: '#ffb4ab', fontSize: 11, fontWeight: '600' }}>Sold</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sliding main row */}
        <Animated.View
          style={{
            transform: [
              {
                translateX: revealAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -actionWidth],
                }),
              },
            ],
            backgroundColor: theme.colors.elevation.level2,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleReveal}
            className="flex-row justify-between items-center py-3"
          >
            <View className="flex-row items-center gap-3 flex-1 mr-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.colors.elevation.level3 }}
              >
                <Text className="text-xs font-semibold" style={{ color: theme.colors.onSurface }}>
                  {avatarText}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                  {displayName}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: theme.colors.onSurfaceVariant }}>
                  {isGrouped
                    ? `${symInvestments.length} purchases · Qty: ${totalQty}`
                    : [rep.platform, rep.quantity != null ? `Qty: ${rep.quantity}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <View className="items-end">
                <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                  {formatCurrency(symCurrentValue)}
                </Text>
                {symHasCurrentValue ? (
                  <Text className="text-xs mt-0.5" style={{ color: symGainColor }}>
                    {`${symGainPrefix}${formatCurrency(Math.abs(symGain))}`}
                  </Text>
                ) : (
                  <View
                    className="mt-0.5 px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(168,199,250,0.15)' }}
                  >
                    <Text className="text-xs font-medium" style={{ color: '#a8c7fa' }}>
                      Invested
                    </Text>
                  </View>
                )}
              </View>
              {isGrouped && (
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={onToggleExpand}
                >
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Expanded individual purchases */}
      {isGrouped && isExpanded && (
        <View
          className="ml-4 mb-2 rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        >
          {symInvestments.map((inv, invIdx) => (
            <PurchaseRow
              key={inv.id}
              investment={inv}
              isFirst={invIdx === 0}
              toInr={toInr}
            />
          ))}
        </View>
      )}
    </View>
  );
}
