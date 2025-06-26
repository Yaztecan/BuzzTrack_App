// components/ExternalLink.tsx
import { Link, LinkProps } from 'expo-router';
import { Text } from 'react-native';

type Props = {
  /** target URL – must satisfy the new Href type */
  href: LinkProps['href'];
  children: React.ReactNode;
};

/** A thin wrapper that forwards all props to <Link>. */
export default function ExternalLink({ href, children }: Props) {
  return (
    <Link href={href} asChild>
      {/* simple styling wrapper – keep or remove */}
      <Text style={{ color: '#1c64f2' }}>{children}</Text>
    </Link>
  );
}
