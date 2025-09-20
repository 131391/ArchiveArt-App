import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to welcome screen as the main entry point
  return <Redirect href="/welcome" />;
}
