import UseButton from "@/components/UseButton";
import { images, offers } from "@/constants";
import { Fragment } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList 
        data={offers} 
        renderItem={({ item, index}) => {
          return (
            <View>
              <Pressable className="offer-card flex-row-reverse" 
                style={{ backgroundColor: item.color }} 
                android_ripple={{ color: "#FFFFF22" }}>
                {({pressed})    => (
                  <Fragment>
                    <View className={"h-full w-1/2"}>
                      <Image source={item.image} className={"size-full"} resizeMode={"contain"}></Image>
                    </View>
                    <View className={"offer-card-info pl-20"}>
                      <Text className="h1-bold text-white leading-tight">
                        {item.title}
                      </Text>
                      <UseButton></UseButton>
                    </View>
                  </Fragment>
                )}
              </Pressable>
            </View>
          )
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View className="flex-between flex-row w-full my-5 px-5">
            <View className="flex-start">
              <Text className="small-bold text-primary">GymTrack</Text>
              <Image source={images.arrowDown} className="size-3" resizeMode="contain"></Image>
            </View>

            <Text>Perfil</Text>
          </View>
        )}
        />
    </SafeAreaView>
  );
}