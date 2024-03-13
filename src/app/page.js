import Image from "next/image";
import styles from "./page.module.css";
import Sentiment from "./components/Sentiment/Sentiment";

export default function Home() {
  return (
    <main className={styles.main}>
      <Sentiment />
    </main>
  );
}
