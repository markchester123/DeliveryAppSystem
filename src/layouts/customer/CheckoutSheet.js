import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import { EmptyState, useToast } from '../components/Feedback';
import { useCustomerSession } from './CustomerSession';
import { colors, type, radius } from '../theme';
import { peso } from '../../utils/format';

export default function CheckoutSheet({ visible, onClose, onCheckout }) {
  const s = useCustomerSession();
  const toast = useToast();

  const clearCart = () => {
    s.clearCart();
    toast('Cart cleared');
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Your cart">
      {!s.lines.length ? (
        <EmptyState>Your cart is empty.</EmptyState>
      ) : (
        <View>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 14,
              marginBottom: 12,
            }}
          >
            {s.lines.map(({ key, item, qty }) => (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 8,
                }}
              >
                {item.image ? (
                  <Image
                    source={item.image}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: colors.line,
                    }}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={{ flex: 1 }}>
                  <Text style={[type.body, { fontWeight: '600' }]}>
                    {item.name} · {item.size}oz
                  </Text>
                  <Text style={type.small}>{peso(item.price)} each</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable
                    onPress={() => s.remove(key)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: colors.line,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${item.name} ${item.size}oz`}
                  >
                    <Text style={{ fontSize: 18 }}>−</Text>
                  </Pressable>

                  <Text style={{ fontWeight: '700', minWidth: 16, textAlign: 'center' }}>
                    {qty}
                  </Text>

                  <Pressable
                    onPress={() => s.add(key)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: colors.line,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${item.name} ${item.size}oz`}
                  >
                    <Text style={{ fontSize: 18 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <Button
            variant="primary"
            block
            title={`Add to cart · ${peso(s.subtotal)}`}
            onPress={onCheckout}
          />

          <Pressable
            onPress={clearCart}
            style={{ alignItems: 'center', paddingVertical: 14 }}
            accessibilityRole="button"
            accessibilityLabel="Clear cart"
          >
            <Text style={{ color: colors.danger, fontWeight: '600' }}>
              Clear cart
            </Text>
          </Pressable>
        </View>
      )}
    </Sheet>
  );
}